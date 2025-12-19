import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TravelPlan from '@/models/TravelPlan';

// GET /api/admin/trips - List all trips
export async function GET() {
  try {
    await dbConnect();
    const trips = await TravelPlan.find({}).populate('creator', 'name email avatar');
    return NextResponse.json({ trips });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trips', details: error?.message }, { status: 500 });
  }
}
