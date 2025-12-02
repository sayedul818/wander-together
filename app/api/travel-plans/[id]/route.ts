import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TravelPlan from '@/models/TravelPlan';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const planId = params.id;

    const plan = await TravelPlan.findById(planId)
      .populate('creator', 'name email avatar')
      .populate('participants', 'name email avatar');

    if (!plan) {
      return NextResponse.json(
        { error: 'Travel plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { plan },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const planId = params.id;
    const body = await req.json();

    const plan = await TravelPlan.findByIdAndUpdate(
      planId,
      body,
      { new: true }
    )
      .populate('creator', 'name email avatar')
      .populate('participants', 'name email avatar');

    if (!plan) {
      return NextResponse.json(
        { error: 'Travel plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { plan },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const planId = params.id;

    const plan = await TravelPlan.findByIdAndDelete(planId);

    if (!plan) {
      return NextResponse.json(
        { error: 'Travel plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Travel plan deleted' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
