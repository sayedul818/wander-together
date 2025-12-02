import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import User from '@/models/User';

// GET /api/reviews?target=<userId>
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const target = searchParams.get('target');
    if (!target) {
      return NextResponse.json({ error: 'Missing target user id' }, { status: 400 });
    }
    const reviews = await Review.find({ target })
      .populate('author', 'name avatar')
      .populate('travelPlan', 'title')
      .sort({ createdAt: -1 });
    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews', details: error?.message }, { status: 500 });
  }
}
