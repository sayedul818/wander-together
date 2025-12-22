import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await connectToDatabase();
    
    const userId = params.userId;
    
    if (!userId) {
      return Response.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Include followers/following for counts and isFollowing computation
    const user = await User.findById(userId).select('_id name email avatar coverPhoto bio location interests followers following');
    
    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Determine if current viewer follows this user
    const session = await getSession();
    const viewerId = session?.userId?.toString();
    const isFollowing = !!(
      viewerId && Array.isArray(user.followers) && user.followers.some((id: any) => id?.toString() === viewerId)
    );

    return Response.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
        location: user.location,
        interests: user.interests,
        followers: user.followers || [],
        following: user.following || [],
      },
      isFollowing,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
