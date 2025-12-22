import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcryptjs from 'bcryptjs';
import { sign, setSessionCookie } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = registerSchema.parse(body);

    await connectDB();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'user',
      isPremium: false,
      rating: 0,
      reviewCount: 0,
    });

    // Auto-follow default users
    const defaultUserNames = [
      'osman hadi',
      'SAYED',
      'borhan uddin',
      'Abdul_majed_asaad_',
      'tamila shikdar'
    ];

    try {
      // Find default users by name (case-insensitive)
      const defaultUsers = await User.find({
        name: { $in: defaultUserNames.map(n => new RegExp(`^${n}$`, 'i')) }
      }).select('_id followers');

      if (defaultUsers.length > 0) {
        const defaultUserIds = defaultUsers.map(u => u._id);

        // Add default users to new user's following list
        user.following = defaultUserIds;
        await user.save();

        // Add new user to each default user's followers list
        await User.updateMany(
          { _id: { $in: defaultUserIds } },
          { $addToSet: { followers: user._id } }
        );
      }
    } catch (autoFollowError) {
      // Log error but don't fail registration
      console.error('Auto-follow error:', autoFollowError);
    }

    // Create JWT token
    const token = await sign({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set session cookie
    await setSessionCookie(token);

    return NextResponse.json(
      {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
