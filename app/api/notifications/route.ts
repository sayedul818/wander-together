import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');

    // Build query based on filter
    const query: any = { userId: session.userId };
    if (filter === 'unread') {
      query.read = false;
    } else if (!filter || filter === 'all') {
      // For dropdown (default), only show unread
      // For "all" filter from notifications page, show all
      if (!searchParams.has('filter')) {
        query.read = false;
      }
    }

    const notifications = await Notification.find(query)
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(filter ? 50 : 20);

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await Notification.updateMany({ userId: session.userId, read: false }, { $set: { read: true } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
