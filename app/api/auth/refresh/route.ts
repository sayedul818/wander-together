import { NextRequest, NextResponse } from 'next/server';
import { getSession, sign, setSessionCookie } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Re-sign a token with the latest role and user info
    const token = await sign({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set session cookie
    await setSessionCookie(token);

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Refresh session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
