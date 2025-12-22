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
      .select('followers')
      .populate({
        path: 'followers',
        select: 'name avatar location rating reviewCount',
      });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ followers: user.followers || [] });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
