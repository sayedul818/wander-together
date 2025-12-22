import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Story from '@/models/Story';
import Message from '@/models/Message';
import Notification from '@/models/Notification';
import User from '@/models/User';

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

    // Add reply to story
    story.replies?.push({ userId: session.userId as any, message: message.trim(), createdAt: new Date() } as any);
    await story.save();
    await story.populate('replies.userId', 'name avatar');

    // Send message to story owner with the story image (if not replying to own story)
    if (story.userId.toString() !== session.userId) {
      const sender = await User.findById(session.userId).select('name');
      
      // Create a message in the messenger with the story image
      await Message.create({
        sender: session.userId,
        recipient: story.userId,
        content: `📸 Replied to your story: "${message.trim()}"`,
        image: story.image, // Include the story image
        storyId: story._id,
        read: false
      });

      // Also create a notification
      await Notification.create({
        userId: story.userId,
        senderId: session.userId,
        type: 'story_reply',
        storyId: story._id,
        message: `${sender?.name || 'Someone'} replied to your story: "${message.trim().substring(0, 50)}${message.length > 50 ? '...' : ''}"`
      });
    }

    return NextResponse.json({ replies: story.replies });
  } catch (error) {
    console.error('Error replying to story', error);
    return NextResponse.json({ error: 'Failed to reply' }, { status: 500 });
  }
}
