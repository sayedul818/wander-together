import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string; commentId: string; replyId: string } }
) {
  try {
    await connectDB();
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, commentId, replyId } = params;
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

    const reply: any = comment.replies?.find(
      (r: any) => r._id?.toString() === replyId
    );

    if (!reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    if (!reply.reactions) reply.reactions = [];

    const existingReaction = reply.reactions.find(
      (r: any) => r.userId?.toString() === session.userId
    );

    if (existingReaction) {
      if (existingReaction.type === reactionType) {
        reply.reactions = reply.reactions.filter(
          (r: any) => r.userId?.toString() !== session.userId
        );
      } else {
        existingReaction.type = reactionType;
      }
    } else {
      reply.reactions.push({
        userId: new mongoose.Types.ObjectId(session.userId),
        type: reactionType,
        createdAt: new Date(),
      });

      if (post.userId.toString() !== session.userId) {
        await Notification.create({
          userId: reply.userId,
          senderId: new mongoose.Types.ObjectId(session.userId),
          type: 'like',
          postId: post._id,
          message: 'Reacted to your reply',
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

    const postObj = post.toObject();
    const reactionUserIds = new Set<string>();

    postObj.comments?.forEach((c: any) => {
      c.reactions?.forEach((reac: any) => {
        if (reac.userId) reactionUserIds.add(reac.userId.toString());
      });
      c.replies?.forEach((r: any) => {
        r.reactions?.forEach((reac: any) => {
          if (reac.userId) reactionUserIds.add(reac.userId.toString());
        });
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

    return NextResponse.json(postObj);
  } catch (error) {
    console.error('Error reacting to reply:', error);
    return NextResponse.json({ error: 'Failed to react to reply' }, { status: 500 });
  }
}
