import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const users = await User.find({}, {
      _id: 1,
      name: 1,
      email: 1,
      role: 1,
      isPremium: 1,
      createdAt: 1,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
