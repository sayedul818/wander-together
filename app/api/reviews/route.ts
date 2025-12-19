import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

// GET /api/reviews?target=<userId>
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const target = searchParams.get('target');
    
    if (!target) {
      // Return all reviews with full target user data for aggregation
      const reviews = await Review.find({})
        .populate('author', 'name avatar')
        .populate('target', 'name avatar location interests')
        .populate('travelPlan', 'title')
        .sort({ createdAt: -1 });
      return NextResponse.json({ reviews });
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

// POST /api/reviews - Create a new review
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { target, rating, comment, travelPlan } = body;

    // Validate required fields
    if (!target || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user is trying to review themselves
    if (session.userId === target) {
      return NextResponse.json({ error: 'You cannot review yourself' }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await User.findById(target);
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Create review
    const review = await Review.create({
      author: session.userId,
      target,
      rating,
      comment,
      travelPlan
    });

    // Populate author and target
    await review.populate('author', 'name avatar');
    await review.populate('target', 'name avatar');
    if (travelPlan) {
      await review.populate('travelPlan', 'title');
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review', details: error?.message }, { status: 500 });
  }
}
