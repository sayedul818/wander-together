import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Sponsor from '@/models/Sponsor';

// GET /api/sponsors - Get active sponsors for public display
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const now = new Date();
    
    // Get active sponsors within their date range
    const sponsors = await Sponsor.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } }
      ]
    })
    .sort({ priority: -1, createdAt: -1 })
    .limit(4);

    // Filter out expired sponsors
    const activeSponsors = sponsors.filter(s => {
      if (!s.endDate) return true;
      return new Date(s.endDate) >= now;
    });

    // Increment impressions for returned sponsors
    const sponsorIds = activeSponsors.map(s => s._id);
    if (sponsorIds.length > 0) {
      await Sponsor.updateMany(
        { _id: { $in: sponsorIds } },
        { $inc: { impressions: 1 } }
      );
    }

    return NextResponse.json({ 
      sponsors: activeSponsors.map(s => ({
        _id: s._id,
        title: s.title,
        description: s.description,
        image: s.image,
        link: s.link,
      }))
    });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 });
  }
}

// POST /api/sponsors - Track sponsor click
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { sponsorId } = await req.json();

    if (!sponsorId) {
      return NextResponse.json({ error: 'Sponsor ID required' }, { status: 400 });
    }

    await Sponsor.findByIdAndUpdate(sponsorId, { $inc: { clicks: 1 } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
  }
}
