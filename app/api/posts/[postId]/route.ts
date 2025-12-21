import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Post from '@/models/Post';

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await connectDB();
    const { postId } = params;
    const post = await Post.findById(postId)
      .populate('userId', 'name avatar')
      .populate('comments.userId', 'name avatar')
      .populate('reactions.userId', 'name avatar');
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { postId } = params;
    const updates = await req.json();

    const post = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    // Check if user owns the post or is admin
    if (post.userId.toString() !== session.userId && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    Object.assign(post, updates, { edited: true, editedAt: new Date() });
    await post.save();
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { postId } = params;

    const post = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    // Check if user owns the post or is admin
    if (post.userId.toString() !== session.userId && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Post.findByIdAndDelete(postId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
