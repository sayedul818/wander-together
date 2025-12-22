import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TravelPlan from '@/models/TravelPlan';
import Post from '@/models/Post';

// GET /api/destinations/popular - Get popular destinations
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Aggregate destinations from travel plans with images
    const travelPlanDestinations = await TravelPlan.aggregate([
      { $match: { destination: { $exists: true, $ne: '' } } },
      { 
        $group: { 
          _id: { $toLower: '$destination' },
          originalName: { $first: '$destination' },
          count: { $sum: 1 },
          participants: { $sum: '$currentParticipants' },
          image: { $first: '$image' }
        } 
      },
      { $sort: { participants: -1, count: -1 } },
      { $limit: 10 }
    ]);

    // Aggregate locations from posts with images
    const postLocations = await Post.aggregate([
      { $match: { location: { $exists: true, $ne: '' } } },
      { 
        $group: { 
          _id: { $toLower: '$location' },
          originalName: { $first: '$location' },
          count: { $sum: 1 },
          image: { $first: { $arrayElemAt: ['$images', 0] } }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Combine and deduplicate destinations
    const combinedMap = new Map<string, { name: string; travelers: number; image?: string }>();

    for (const dest of travelPlanDestinations) {
      const key = dest._id;
      const existing = combinedMap.get(key);
      const travelers = dest.participants || dest.count;
      
      if (existing) {
        existing.travelers += travelers;
        if (!existing.image && dest.image) {
          existing.image = dest.image;
        }
      } else {
        combinedMap.set(key, {
          name: dest.originalName,
          travelers: travelers,
          image: dest.image
        });
      }
    }

    for (const loc of postLocations) {
      const key = loc._id;
      const existing = combinedMap.get(key);
      
      if (existing) {
        existing.travelers += loc.count;
        if (!existing.image && loc.image) {
          existing.image = loc.image;
        }
      } else {
        combinedMap.set(key, {
          name: loc.originalName,
          travelers: loc.count,
          image: loc.image
        });
      }
    }

    // Convert to array and sort by travelers
    let destinations = Array.from(combinedMap.values())
      .sort((a, b) => b.travelers - a.travelers)
      .slice(0, 5)
      .map(dest => ({
        name: dest.name,
        image: dest.image || null,
        travelers: dest.travelers >= 1000 
          ? `${(dest.travelers / 1000).toFixed(1)}k` 
          : dest.travelers.toString()
      }));

    // If no real data, return empty array (frontend will show fallback)
    return NextResponse.json({ destinations });
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 });
  }
}
