import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;

    if (userId === session.userId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const user = await User.findById(session.userId);
    const targetUser = await User.findById(userId);

    if (!user || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isFollowing = user.following?.includes(userId as any);

    if (isFollowing) {
      // Unfollow
      user.following = user.following?.filter((id: any) => id.toString() !== userId);
      targetUser.followers = targetUser.followers?.filter((id: any) => id.toString() !== session.userId);
    } else {
      // Follow
      if (!user.following) user.following = [];
      if (!targetUser.followers) targetUser.followers = [];
      user.following.push(userId as any);
      targetUser.followers.push(session.userId as any);

      // Create notification
      await Notification.create({
        userId,
        senderId: session.userId,
        type: 'follow',
        message: 'Started following you'
      });
    }

    await user.save();
    await targetUser.save();

    return NextResponse.json({
      following: isFollowing ? false : true,
      user: targetUser
    });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
  }
}
