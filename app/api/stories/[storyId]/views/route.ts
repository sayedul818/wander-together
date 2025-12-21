import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Story from '@/models/Story';

interface Params {
  params: { storyId: string };
}

export async function POST(_req: NextRequest, { params }: Params) {
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

    const alreadyViewed = story.views.some((v: any) => v.toString() === session.userId);
    if (!alreadyViewed) {
      story.views.push(session.userId as any);
      await story.save();
    }

    return NextResponse.json({ views: story.views.length });
  } catch (error) {
    console.error('Error recording view', error);
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
  }
}
