import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || null;

    let tokenPayload = null;
    let dbUser = null;

    if (token) {
      try {
        tokenPayload = await verify(token);
      } catch (err) {
        tokenPayload = { error: 'Invalid token', details: String(err) };
      }

      if (tokenPayload && (tokenPayload as any).userId) {
        await connectDB();
        const user = await User.findById((tokenPayload as any).userId).select('-password');
        if (user) {
          dbUser = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            isPremium: user.isPremium,
          };
        }
      }
    }

    return NextResponse.json({ tokenPayload, dbUser, tokenPresent: !!token });
  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
