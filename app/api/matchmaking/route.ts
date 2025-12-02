import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TravelPlan from '@/models/TravelPlan';

// Helper: Calculate date overlap percentage
function getDateOverlapScore(userStart: Date, userEnd: Date, tripStart: Date, tripEnd: Date) {
  if (tripStart > userEnd || tripEnd < userStart) return 0;
  const overlapStart = Math.max(userStart.getTime(), tripStart.getTime());
  const overlapEnd = Math.min(userEnd.getTime(), tripEnd.getTime());
  const overlap = Math.max(0, overlapEnd - overlapStart);
  const userRange = userEnd.getTime() - userStart.getTime();
  if (userRange === 0) return 0;
  const percent = overlap / userRange;
  if (percent >= 0.99) return 25;
  if (percent >= 0.7) return 20;
  if (percent >= 0.4) return 10;
  return 0;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { destination, startDate, endDate, budget, interests, travelStyle } = body;

    // 1. Fetch candidate trips (destination regex, not cancelled, has creator)
    const regex = new RegExp(destination, 'i');
    const plans = await TravelPlan.find({
      destination: { $regex: regex },
      status: { $ne: 'cancelled' },
    })
      .populate('creator', 'name email avatar')
      .lean();

    // 2. Score each plan
    const userStart = new Date(startDate);
    const userEnd = new Date(endDate);
    const userBudget = Number(budget);
    const userInterests = Array.isArray(interests) ? interests : [];
    const userStyle = travelStyle?.toLowerCase();

    const scored = plans.map(plan => {
      let score = 0;
      // Destination match (40%)
      // Always allow partial matches, not just exact
      const planDest = plan.destination.toLowerCase();
      const userDest = destination.toLowerCase();
      if (planDest === userDest) score += 40;
      else if (planDest.includes(userDest) || userDest.includes(planDest)) score += 30;
      else if (regex.test(planDest)) score += 15;
      // Date overlap (25%)
      score += getDateOverlapScore(userStart, userEnd, new Date(plan.startDate), new Date(plan.endDate));
      // Budget (10%)
      if (plan.budget && userBudget) {
        const diff = Math.abs(plan.budget - userBudget);
        if (diff <= 2000) score += 10;
        else if (diff <= 4000) score += 5;
      }
      // Interests (20%)
      if (Array.isArray(plan.interests) && userInterests.length) {
        const common = plan.interests.filter((i: string) => userInterests.includes(i));
        score += Math.min(common.length * 5, 20);
      }
      // Travel style (5%)
      if (plan.travelStyle && userStyle && plan.travelStyle.toLowerCase() === userStyle) score += 5;
      return { ...plan, score };
    });

    // 3. Sort and return top 5
    const topMatches = scored
      .filter(plan => plan.creator && (plan.creator as any)?.name)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return NextResponse.json({ matches: topMatches }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
