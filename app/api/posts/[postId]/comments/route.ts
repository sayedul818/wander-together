import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import Notification from '@/models/Notification';

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
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (!post.comments) post.comments = [];

    const comment = {
      _id: new (require('mongoose')).Types.ObjectId(),
      userId: session.userId,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    post.comments.push(comment as any);
    await post.save();

    // Create notification
    if (post.userId.toString() !== session.userId) {
      await Notification.create({
        userId: post.userId,
        senderId: session.userId,
        type: 'comment',
        postId: post._id,
        message: `Commented on your post`
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

    return NextResponse.json(postObj, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
