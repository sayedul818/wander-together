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
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { postId, commentId } = params;
    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 });

    const post = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const comment = post.comments?.find((c: any) => c._id.toString() === commentId);
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

    if (!comment.replies) comment.replies = [] as any;

    const reply = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(session.userId),
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
      likes: []
    };

    (comment.replies as any).push(reply);
    await post.save();

    if (post.userId.toString() !== session.userId) {
      await Notification.create({
        userId: post.userId,
        senderId: new mongoose.Types.ObjectId(session.userId),
        type: 'comment',
        postId: post._id,
        message: 'Replied to a comment on your post'
      });
    }

    await post.populate([
      { path: 'userId', select: 'name avatar email location' },
      { path: 'tripId', select: 'title destination' },
      { path: 'comments.userId', select: 'name avatar' },
      { path: 'reactions.userId', select: 'name avatar' },
    ]);

    // Manually populate reply user data
    const postObj = post.toObject();
    const replyUserIds = new Set<string>();
    postObj.comments?.forEach((c: any) => {
      c.replies?.forEach((r: any) => {
        if (r.userId) replyUserIds.add(r.userId.toString());
      });
    });

    if (replyUserIds.size > 0) {
      const replyUsers = await User.find({ 
        _id: { $in: Array.from(replyUserIds) } 
      }).select('name avatar').lean();
      
      const userMap = new Map(replyUsers.map((u: any) => [u._id.toString(), u]));

      postObj.comments?.forEach((c: any) => {
        c.replies?.forEach((r: any) => {
          if (r.userId) {
            const userData = userMap.get(r.userId.toString());
            if (userData) {
              r.userId = userData;
            }
          }
        });
      });
    }

    return NextResponse.json(postObj, { status: 201 });
  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json({ error: 'Failed to add reply' }, { status: 500 });
  }
}
