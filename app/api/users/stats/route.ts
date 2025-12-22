import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import TravelPlan from '@/models/TravelPlan';
import Post from '@/models/Post';

// GET /api/users/stats - Get current user's stats
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userId = session.userId;

    // Get trip count (created or participating)
    const tripCount = await TravelPlan.countDocuments({
      $or: [
        { creator: userId },
        { participants: userId }
      ]
    });

    // Get post count
    const postCount = await Post.countDocuments({ author: userId });

    // Get buddies count (followers + following unique)
    const user = await User.findById(userId)
      .select('followers following')
      .lean();

    const followersCount = user?.followers?.length || 0;
    const followingCount = user?.following?.length || 0;
    
    // Buddies = unique connections (people you follow or who follow you)
    const allConnections = new Set([
      ...(user?.followers?.map(f => f.toString()) || []),
      ...(user?.following?.map(f => f.toString()) || [])
    ]);
    const buddiesCount = allConnections.size;

    return NextResponse.json({
      stats: {
        trips: tripCount,
        buddies: buddiesCount,
        posts: postCount
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
