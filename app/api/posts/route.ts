import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getSession(); // may be null for public viewers

    const { searchParams } = new URL(req.url);
    const scope = (searchParams.get('scope') || 'global').toLowerCase();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let query: any;
    if (scope === 'following') {
      if (!session?.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // Get user's following list
      const user = await User.findById(session.userId).select('following');
      const followingIds = user?.following || [];
      followingIds.push(new Types.ObjectId(session.userId)); // Include own posts
      query = {
        userId: { $in: followingIds },
        privacy: { $in: ['public', 'friends'] },
      };
    } else {
      // Global public posts (no auth required)
      query = { privacy: 'public' };
    }

    const posts = await Post.find(query)
      .populate('userId', 'name avatar email location')
      .populate('tripId', 'title destination')
      .populate('comments.userId', 'name avatar')
      .populate('reactions.userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Manually populate reply user data (Mongoose can't populate nested arrays)
    const replyUserIds = new Set<string>();
    posts.forEach((post: any) => {
      post.comments?.forEach((comment: any) => {
        comment.replies?.forEach((reply: any) => {
          if (reply.userId) replyUserIds.add(reply.userId.toString());
        });
      });
    });

    if (replyUserIds.size > 0) {
      const replyUsers = await User.find({ 
        _id: { $in: Array.from(replyUserIds) } 
      }).select('name avatar').lean();
      
      const userMap = new Map(replyUsers.map((u: any) => [u._id.toString(), u]));

      posts.forEach((post: any) => {
        post.comments?.forEach((comment: any) => {
          comment.replies?.forEach((reply: any) => {
            if (reply.userId) {
              const userData = userMap.get(reply.userId.toString());
              if (userData) {
                reply.userId = userData;
              }
            }
          });
        });
      });
    }

    const total = await Post.countDocuments(query);

    return NextResponse.json({
      posts,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, postType, images, videoUrl, location, tripId, privacy } = await req.json();

    if (!content || !postType) {
      return NextResponse.json({ error: 'Content and postType required' }, { status: 400 });
    }

    const post = new Post({
      userId: session.userId,
      content,
      postType,
      images: images || [],
      videoUrl,
      location,
      tripId,
      privacy: privacy || 'public'
    });

    await post.save();
    await post.populate('userId', 'name avatar email location');

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
