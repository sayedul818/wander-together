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

    const { type } = await req.json();
    const validTypes = ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 });
    }

    const story = await Story.findById(params.storyId);
    if (!story) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const existingIndex = story.reactions?.findIndex((r: any) => r.userId.toString() === session.userId) ?? -1;
    if (existingIndex >= 0) {
      if (story.reactions![existingIndex].type === type) {
        story.reactions!.splice(existingIndex, 1); // toggle off
      } else {
        story.reactions![existingIndex].type = type;
      }
    } else {
      story.reactions?.push({ userId: session.userId as any, type } as any);
    }

    await story.save();
    await story.populate('reactions.userId', 'name avatar');

    return NextResponse.json({ reactions: story.reactions });
  } catch (error) {
    console.error('Error reacting to story', error);
    return NextResponse.json({ error: 'Failed to react' }, { status: 500 });
  }
}
