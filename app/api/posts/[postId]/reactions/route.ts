import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await connectDB();
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const { reactionType } = await req.json();

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user already reacted
    const existingReaction = post.reactions?.find(
      (r: any) => r.userId.toString() === session.userId
    );

    if (existingReaction) {
      if (existingReaction.type === reactionType) {
        // Remove reaction
        post.reactions = post.reactions?.filter(
          (r: any) => r.userId.toString() !== session.userId
        );
      } else {
        // Update reaction
        existingReaction.type = reactionType;
      }
    } else {
      // Add new reaction
      if (!post.reactions) post.reactions = [];
      post.reactions.push({
        userId: new mongoose.Types.ObjectId(session.userId),
        type: reactionType,
        createdAt: new Date()
      });

      // Create notification
      if (post.userId.toString() !== session.userId) {
        await Notification.create({
          userId: post.userId,
          senderId: new mongoose.Types.ObjectId(session.userId),
          type: 'like',
          postId: post._id,
          message: `Reacted to your post`
        });
      }
    }

    await post.save();
    await post.populate([
      { path: 'userId', select: 'name avatar email location' },
      { path: 'tripId', select: 'title destination' },
      { path: 'comments.userId', select: 'name avatar' },
      { path: 'reactions.userId', select: 'name avatar' },
    ]);

    // Manually populate reply user data
    const postObj = post.toObject();
    const replyUserIds = new Set<string>();
    postObj.comments?.forEach((comment: any) => {
      comment.replies?.forEach((reply: any) => {
        if (reply.userId) replyUserIds.add(reply.userId.toString());
      });
    });

    if (replyUserIds.size > 0) {
      const replyUsers = await User.find({ 
        _id: { $in: Array.from(replyUserIds) } 
      }).select('name avatar').lean();
      
      const userMap = new Map(replyUsers.map((u: any) => [u._id.toString(), u]));

      postObj.comments?.forEach((comment: any) => {
        comment.replies?.forEach((reply: any) => {
          if (reply.userId) {
            const userData = userMap.get(reply.userId.toString());
            if (userData) {
              reply.userId = userData;
            }
          }
        });
      });
    }

    return NextResponse.json(postObj);
  } catch (error) {
    console.error('Error reacting to post:', error);
    return NextResponse.json({ error: 'Failed to react to post' }, { status: 500 });
  }
}
