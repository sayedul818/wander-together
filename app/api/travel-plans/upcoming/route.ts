import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TravelPlan from '@/models/TravelPlan';

// GET /api/travel-plans/upcoming - Get upcoming travel plans
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const now = new Date();

    // Find upcoming travel plans (startDate > now, not cancelled)
    const upcomingTrips = await TravelPlan.find({
      startDate: { $gte: now },
      status: { $in: ['planning', 'confirmed'] }
    })
      .sort({ startDate: 1 })
      .limit(5)
      .select('title destination startDate interests')
      .lean();

    // Format the response
    const upcoming = upcomingTrips.map(trip => {
      const startDate = new Date(trip.startDate);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedDate = `${monthNames[startDate.getMonth()]} ${startDate.getDate()}`;
      
      // Create a label from title and destination
      const interest = trip.interests?.[0] || 'Trip';
      const label = `${interest} • ${trip.destination}`;

      return {
        _id: trip._id.toString(),
        date: formattedDate,
        label: label,
        title: trip.title
      };
    });

    return NextResponse.json({ upcoming });
  } catch (error) {
    console.error('Error fetching upcoming trips:', error);
    return NextResponse.json({ error: 'Failed to fetch upcoming trips' }, { status: 500 });
  }
}
