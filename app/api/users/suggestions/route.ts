import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getSession();

    const limit = Number(new URL(req.url).searchParams.get('limit') || 6);

    const viewerId = session?.userId;
    const query: any = viewerId
      ? { _id: { $ne: viewerId }, followers: { $ne: viewerId } }
      : {};

    const users = await User.find(query)
      .select('_id name avatar location interests rating reviewCount')
      .sort({ reviewCount: -1, rating: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('suggestions error', error);
    return NextResponse.json({ users: [] });
  }
}
