import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Story from '@/models/Story';
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
    let isNewReaction = false;
    
    if (existingIndex >= 0) {
      if (story.reactions![existingIndex].type === type) {
        story.reactions!.splice(existingIndex, 1); // toggle off
      } else {
        story.reactions![existingIndex].type = type;
        isNewReaction = true; // Changed reaction type
      }
    } else {
      story.reactions?.push({ userId: session.userId as any, type } as any);
      isNewReaction = true;
    }

    await story.save();
    await story.populate('reactions.userId', 'name avatar');

    // Send notification to story owner (if not reacting to own story)
    if (isNewReaction && story.userId.toString() !== session.userId) {
      const sender = await User.findById(session.userId).select('name');
      const reactionEmojis: Record<string, string> = {
        like: '👍',
        love: '❤️',
        care: '🥰',
        haha: '😂',
        wow: '😮',
        sad: '😢',
        angry: '😡'
      };
      
      // Check if notification already exists to avoid duplicates
      const existingNotification = await Notification.findOne({
        userId: story.userId,
        senderId: session.userId,
        storyId: story._id,
        type: 'story_reaction'
      });

      if (!existingNotification) {
        await Notification.create({
          userId: story.userId,
          senderId: session.userId,
          type: 'story_reaction',
          storyId: story._id,
          message: `${sender?.name || 'Someone'} reacted ${reactionEmojis[type] || ''} to your story`
        });
      } else {
        // Update existing notification with new reaction
        existingNotification.message = `${sender?.name || 'Someone'} reacted ${reactionEmojis[type] || ''} to your story`;
        existingNotification.read = false;
        await existingNotification.save();
      }
    }

    return NextResponse.json({ reactions: story.reactions });
  } catch (error) {
    console.error('Error reacting to story', error);
    return NextResponse.json({ error: 'Failed to react' }, { status: 500 });
  }
}
