import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
  location: z.string().optional(),
  interests: z.array(z.string()).optional(),
  visitedCountries: z.array(z.string()).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = profileUpdateSchema.parse(body);

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.userId,
      {
        name: validatedData.name,
        bio: validatedData.bio,
        location: validatedData.location,
        interests: validatedData.interests,
        visitedCountries: validatedData.visitedCountries,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isPremium: user.isPremium,
          avatar: user.avatar,
          bio: user.bio,
          location: user.location,
          interests: user.interests,
          visitedCountries: user.visitedCountries,
          rating: user.rating,
          reviewCount: user.reviewCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
