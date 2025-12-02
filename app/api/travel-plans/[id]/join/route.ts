import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TravelPlan from '@/models/TravelPlan';
import { getSession } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const planId = params.id;

    const plan = await TravelPlan.findById(planId);

    if (!plan) {
      return NextResponse.json(
        { error: 'Travel plan not found' },
        { status: 404 }
      );
    }

    // Check if already a participant
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    if (plan.participants.includes(userObjectId)) {
      return NextResponse.json(
        { error: 'You are already a participant in this trip' },
        { status: 400 }
      );
    }

    // Check if trip is full
    if (plan.currentParticipants >= plan.maxParticipants) {
      return NextResponse.json(
        { error: 'This trip is full' },
        { status: 400 }
      );
    }

    // Add user to participants
    plan.participants.push(userObjectId);
    plan.currentParticipants += 1;
    await plan.save();

    // Fetch updated plan with populated fields
    const updatedPlan = await TravelPlan.findById(planId)
      .populate('creator', 'name email avatar')
      .populate('participants', 'name email avatar');

    return NextResponse.json(
      { plan: updatedPlan, message: 'Successfully joined the trip' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error joining trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
