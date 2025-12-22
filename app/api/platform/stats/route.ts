import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import TravelPlan from '@/models/TravelPlan';
import Review from '@/models/Review';

export async function GET() {
  try {
    await dbConnect();

    // Get counts in parallel for better performance
    const [
      activeTravelers,
      totalTrips,
      matchedTrips,
      reviewStats,
      uniqueCountries
    ] = await Promise.all([
      // Count active users (users who have created at least one trip or post)
      User.countDocuments({}),
      
      // Count total travel plans
      TravelPlan.countDocuments({}),
      
      // Count trips that have been matched (more than 1 participant)
      TravelPlan.countDocuments({ currentParticipants: { $gt: 1 } }),
      
      // Calculate average rating from reviews
      Review.aggregate([
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]),
      
      // Count unique countries from travel plans destinations
      TravelPlan.distinct('destination')
    ]);

    // Extract average rating (default to 0 if no reviews)
    const avgRating = reviewStats.length > 0 
      ? Math.round(reviewStats[0].avgRating * 10) / 10 
      : 0;

    // Format the stats for display
    const formatNumber = (num: number): string => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K+`;
      }
      return `${num}+`;
    };

    const stats = {
      activeTravelers: {
        value: formatNumber(activeTravelers),
        raw: activeTravelers
      },
      countries: {
        value: `${uniqueCountries.length}+`,
        raw: uniqueCountries.length
      },
      tripsMatched: {
        value: formatNumber(matchedTrips),
        raw: matchedTrips
      },
      averageRating: {
        value: avgRating > 0 ? avgRating.toFixed(1) : 'N/A',
        raw: avgRating
      }
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform stats' },
      { status: 500 }
    );
  }
}
