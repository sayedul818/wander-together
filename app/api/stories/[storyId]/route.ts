import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Story from '@/models/Story';

interface Params {
  params: { storyId: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const story = await Story.findById(params.storyId)
      .populate('userId', 'name avatar location')
      .populate('replies.userId', 'name avatar')
      .populate('reactions.userId', 'name avatar')
      .lean();

    if (!story) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error fetching story', error);
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const story = await Story.findById(params.storyId);
    if (!story) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const isOwner = story.userId.toString() === session.userId;
    const isAdmin = session.role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await story.deleteOne();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story', error);
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
  }
}
