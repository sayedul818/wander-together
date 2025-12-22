import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TravelPlan from '@/models/TravelPlan';

// GET /api/users/[userId]/trips - Get trips created by a user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectDB();

    const trips = await TravelPlan.find({ creator: userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Error fetching user trips:', error);
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}
