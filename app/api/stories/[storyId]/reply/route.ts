import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Story from '@/models/Story';

interface Params {
  params: { storyId: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const story = await Story.findById(params.storyId);
    if (!story) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    story.replies?.push({ userId: session.userId as any, message: message.trim(), createdAt: new Date() } as any);
    await story.save();
    await story.populate('replies.userId', 'name avatar');

    return NextResponse.json({ replies: story.replies });
  } catch (error) {
    console.error('Error replying to story', error);
    return NextResponse.json({ error: 'Failed to reply' }, { status: 500 });
  }
}
