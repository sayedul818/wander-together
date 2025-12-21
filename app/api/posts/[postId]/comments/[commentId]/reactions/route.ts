import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    await connectDB();
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, commentId } = params;
    const { reactionType } = await req.json();

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comment: any = post.comments?.find(
      (c: any) => c._id.toString() === commentId
    );

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (!comment.reactions) comment.reactions = [];

    const existingReaction = comment.reactions.find(
      (r: any) => r.userId?.toString() === session.userId
    );

    if (existingReaction) {
      if (existingReaction.type === reactionType) {
        comment.reactions = comment.reactions.filter(
          (r: any) => r.userId?.toString() !== session.userId
        );
      } else {
        existingReaction.type = reactionType;
      }
    } else {
      comment.reactions.push({
        userId: new mongoose.Types.ObjectId(session.userId),
        type: reactionType,
        createdAt: new Date(),
      });

      if (post.userId.toString() !== session.userId) {
        await Notification.create({
          userId: comment.userId,
          senderId: new mongoose.Types.ObjectId(session.userId),
          type: 'like',
          postId: post._id,
          message: 'Reacted to your comment',
        });
      }
    }

    await post.save();
    await post.populate([
      { path: 'userId', select: 'name avatar email location' },
      { path: 'tripId', select: 'title destination' },
      { path: 'comments.userId', select: 'name avatar' },
      { path: 'reactions.userId', select: 'name avatar' },
      { path: 'comments.replies.userId', select: 'name avatar' },
    ]);

    // Manually populate reply user data (existing behavior)
    const postObj = post.toObject();
    const replyUserIds = new Set<string>();
    const reactionUserIds = new Set<string>();

    postObj.comments?.forEach((c: any) => {
      c.replies?.forEach((r: any) => {
        if (r.userId) replyUserIds.add(r.userId.toString());
        r.reactions?.forEach((reac: any) => {
          if (reac.userId) reactionUserIds.add(reac.userId.toString());
        });
      });
      c.reactions?.forEach((reac: any) => {
        if (reac.userId) reactionUserIds.add(reac.userId.toString());
      });
    });

    if (reactionUserIds.size > 0) {
      const reactionUsers = await User.find({ _id: { $in: Array.from(reactionUserIds) } })
        .select('name avatar')
        .lean();
      const userMap = new Map(reactionUsers.map((u: any) => [u._id.toString(), u]));

      postObj.comments?.forEach((c: any) => {
        c.reactions?.forEach((reac: any) => {
          const userData = userMap.get(reac.userId?.toString());
          if (userData) reac.userId = userData;
        });
        c.replies?.forEach((r: any) => {
          r.reactions?.forEach((reac: any) => {
            const userData = userMap.get(reac.userId?.toString());
            if (userData) reac.userId = userData;
          });
        });
      });
    }

    if (replyUserIds.size > 0) {
      const replyUsers = await User.find({ _id: { $in: Array.from(replyUserIds) } })
        .select('name avatar')
        .lean();
      const replyMap = new Map(replyUsers.map((u: any) => [u._id.toString(), u]));

      postObj.comments?.forEach((c: any) => {
        c.replies?.forEach((r: any) => {
          const userData = replyMap.get(r.userId?.toString());
          if (userData) r.userId = userData;
        });
      });
    }

    return NextResponse.json(postObj);
  } catch (error) {
    console.error('Error reacting to comment:', error);
    return NextResponse.json({ error: 'Failed to react to comment' }, { status: 500 });
  }
}
