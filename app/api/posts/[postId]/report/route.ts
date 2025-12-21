import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Report from '@/models/Report';

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { postId } = params;
    const { reason, details } = await req.json();
    if (!reason) return NextResponse.json({ error: 'Reason required' }, { status: 400 });

    const report = await Report.create({
      postId,
      reporterId: session.userId,
      reason,
      details,
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to report post' }, { status: 500 });
  }
}
