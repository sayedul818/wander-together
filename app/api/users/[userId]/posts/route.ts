import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();
    const { userId } = params;

    const posts = await Post.find({ userId })
      .populate('userId', 'name avatar')
      .populate('comments.userId', 'name avatar')
      .populate('reactions.userId', 'name avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
