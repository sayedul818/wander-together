import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import TravelPlan from '@/models/TravelPlan';
import Post from '@/models/Post';

// GET /api/users/top-travelers - Get top travelers based on trips and posts
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get users with most travel plans
    const usersWithTrips = await TravelPlan.aggregate([
      { 
        $group: { 
          _id: '$creator',
          tripCount: { $sum: 1 }
        } 
      },
      { $sort: { tripCount: -1 } },
      { $limit: 20 }
    ]);

    // Get users with most posts
    const usersWithPosts = await Post.aggregate([
      { 
        $group: { 
          _id: '$author',
          postCount: { $sum: 1 }
        } 
      },
      { $sort: { postCount: -1 } },
      { $limit: 20 }
    ]);

    // Combine scores
    const userScores = new Map<string, { tripCount: number; postCount: number }>();

    for (const u of usersWithTrips) {
      if (u._id) {
        userScores.set(u._id.toString(), { tripCount: u.tripCount, postCount: 0 });
      }
    }

    for (const u of usersWithPosts) {
      if (u._id) {
        const existing = userScores.get(u._id.toString());
        if (existing) {
          existing.postCount = u.postCount;
        } else {
          userScores.set(u._id.toString(), { tripCount: 0, postCount: u.postCount });
        }
      }
    }

    // Calculate total score and sort
    const sortedUsers = Array.from(userScores.entries())
      .map(([userId, scores]) => ({
        userId,
        score: scores.tripCount * 2 + scores.postCount, // Trips weighted more
        tripCount: scores.tripCount,
        postCount: scores.postCount
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Fetch user details
    const userIds = sortedUsers.map(u => u.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name email avatar')
      .lean();

    // Create user map for quick lookup
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    // Build response
    const topTravelers = sortedUsers
      .map(u => {
        const user = userMap.get(u.userId);
        if (!user) return null;
        // Generate username from email
        const username = user.email.split('@')[0];
        return {
          _id: u.userId,
          name: user.name,
          username: username,
          avatar: user.avatar,
          trips: u.tripCount,
          posts: u.postCount
        };
      })
      .filter(Boolean);

    return NextResponse.json({ travelers: topTravelers });
  } catch (error) {
    console.error('Error fetching top travelers:', error);
    return NextResponse.json({ error: 'Failed to fetch top travelers' }, { status: 500 });
  }
}
