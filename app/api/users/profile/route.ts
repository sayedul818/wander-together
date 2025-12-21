import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, bio, location, interests, avatar, coverPhoto } = await req.json();

    const updateData: any = { name, bio, location, interests };
    if (avatar) updateData.avatar = avatar;
    if (coverPhoto) updateData.coverPhoto = coverPhoto;

    const user = await User.findByIdAndUpdate(
      session.userId,
      updateData,
      { new: true }
    ).select('-password');

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
