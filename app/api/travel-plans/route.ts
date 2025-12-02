import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TravelPlan from '@/models/TravelPlan';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const createPlanSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  destination: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.number().optional(),
  interests: z.array(z.string()),
  maxParticipants: z.number().default(10),
  travelStyle: z.string().optional(),
  accommodationType: z.string().optional(),
  coverPhoto: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filter by creator if ?creator= is provided
    const creator = searchParams.get('creator');
    const filter: any = { status: { $ne: 'cancelled' } };
    if (creator) {
      filter.creator = creator;
    }

    const plans = await TravelPlan.find(filter)
      .populate('creator', 'name email avatar')
      .populate('participants', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TravelPlan.countDocuments(filter);

    return NextResponse.json(
      { plans, total, pages: Math.ceil(total / limit) },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = createPlanSchema.parse(body);

    await connectDB();

    const plan = await TravelPlan.create({
      ...data,
      creator: session.userId,
      participants: [session.userId],
      currentParticipants: 1,
    });

    return NextResponse.json(
      { plan },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
