import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Story from '@/models/Story';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const stories = await Story.find({ expiresAt: { $gt: new Date() } })
      .populate('userId', 'name avatar location')
      .sort({ createdAt: -1 })
      .lean();

    // group latest per user while keeping order
    const latestByUser = new Map<string, any>();
    const ordered: any[] = [];
    for (const story of stories) {
      const uid = story.userId?._id?.toString();
      if (!uid) continue;
      if (!latestByUser.has(uid)) {
        latestByUser.set(uid, []);
        ordered.push({ userId: story.userId, items: latestByUser.get(uid) });
      }
      latestByUser.get(uid).push(story);
    }

    return NextResponse.json({ stories: ordered });
  } catch (error) {
    console.error('Error fetching stories', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image, text, location } = await req.json();
    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const story = await Story.create({
      userId: session.userId,
      image,
      text,
      location,
    });

    await story.populate('userId', 'name avatar location');

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error('Error creating story', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}
