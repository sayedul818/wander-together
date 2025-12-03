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
    if (plan.participants.some((id: mongoose.Types.ObjectId) => id.equals(userObjectId))) {
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

    // Fetch user and enforce join limit for non-premium
    const User = (await import('@/models/User')).default;
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (!user.isPremium) {
      // Count how many trips user has joined (not created)
      const joinedCount = await TravelPlan.countDocuments({
        participants: userObjectId,
        creator: { $ne: userObjectId },
      });
      if (joinedCount >= 3) {
        return NextResponse.json(
          { error: 'Free users can only join up to 3 trips. Upgrade to premium for unlimited joins.' },
          { status: 403 }
        );
      }
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
