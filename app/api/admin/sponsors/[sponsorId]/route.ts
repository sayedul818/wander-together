import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Sponsor from '@/models/Sponsor';

interface Params {
  params: { sponsorId: string };
}

// GET /api/admin/sponsors/[sponsorId] - Get a single sponsor
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const User = (await import('@/models/User')).default;
    const user = await User.findById(session.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const sponsor = await Sponsor.findById(params.sponsorId);
    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    }

    return NextResponse.json({ sponsor });
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    return NextResponse.json({ error: 'Failed to fetch sponsor' }, { status: 500 });
  }
}

// PUT /api/admin/sponsors/[sponsorId] - Update a sponsor
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const User = (await import('@/models/User')).default;
    const user = await User.findById(session.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, image, link, isActive, priority, startDate, endDate } = body;

    const sponsor = await Sponsor.findByIdAndUpdate(
      params.sponsorId,
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(image && { image }),
        ...(link && { link }),
        ...(isActive !== undefined && { isActive }),
        ...(priority !== undefined && { priority }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
      },
      { new: true }
    );

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    }

    return NextResponse.json({ sponsor });
  } catch (error) {
    console.error('Error updating sponsor:', error);
    return NextResponse.json({ error: 'Failed to update sponsor' }, { status: 500 });
  }
}

// DELETE /api/admin/sponsors/[sponsorId] - Delete a sponsor
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const User = (await import('@/models/User')).default;
    const user = await User.findById(session.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const sponsor = await Sponsor.findByIdAndDelete(params.sponsorId);
    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    return NextResponse.json({ error: 'Failed to delete sponsor' }, { status: 500 });
  }
}
