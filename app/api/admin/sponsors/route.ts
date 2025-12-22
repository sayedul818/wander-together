import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Sponsor from '@/models/Sponsor';

// GET /api/admin/sponsors - Get all sponsors (admin only)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const User = (await import('@/models/User')).default;
    const user = await User.findById(session.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const sponsors = await Sponsor.find().sort({ priority: -1, createdAt: -1 });
    return NextResponse.json({ sponsors });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 });
  }
}

// POST /api/admin/sponsors - Create a new sponsor
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const User = (await import('@/models/User')).default;
    const user = await User.findById(session.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, image, link, isActive, priority, startDate, endDate } = body;

    if (!title || !image || !link) {
      return NextResponse.json({ error: 'Title, image, and link are required' }, { status: 400 });
    }

    const sponsor = await Sponsor.create({
      title,
      description,
      image,
      link,
      isActive: isActive ?? true,
      priority: priority ?? 0,
      startDate,
      endDate,
    });

    return NextResponse.json({ sponsor }, { status: 201 });
  } catch (error) {
    console.error('Error creating sponsor:', error);
    return NextResponse.json({ error: 'Failed to create sponsor' }, { status: 500 });
  }
}
