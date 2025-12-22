import connectDB from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const session = await getSession();

    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.userId)
      .select('following')
      .populate({
        path: 'following',
        select: 'name avatar location rating reviewCount',
      });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ following: user.following || [] });
  } catch (error) {
    console.error('Error fetching following:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
