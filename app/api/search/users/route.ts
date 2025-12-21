import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    if (!q) return NextResponse.json({ users: [] });

    const regex = new RegExp(q, 'i');
    const users = await User.find({
      $or: [
        { name: regex },
        { location: regex },
        { interests: regex },
      ],
    }).select('name avatar location interests');

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
