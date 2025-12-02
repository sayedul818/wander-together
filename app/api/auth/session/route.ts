export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    await connectDB();
    const user = await User.findById(session.userId).select('-password');
    if (!user) {
      return NextResponse.json({ user: null, error: 'User not found' }, { status: 401 });
    }
    return NextResponse.json(
      {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isPremium: user.isPremium,
          avatar: user.avatar,
          bio: user.bio,
          interests: user.interests,
          location: user.location,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
