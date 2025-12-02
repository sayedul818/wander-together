import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcryptjs from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@travelbuddy.com' });
    if (adminExists) {
      return NextResponse.json(
        { message: 'Admin user already exists' },
        { status: 200 }
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash('admin123', 10);

    // Create admin user
    const admin = await User.create({
      email: 'admin@travelbuddy.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      isPremium: true,
      rating: 5,
      reviewCount: 0,
    });

    // Create test user
    const userExists = await User.findOne({ email: 'user@example.com' });
    if (!userExists) {
      const userHashedPassword = await bcryptjs.hash('user123', 10);
      await User.create({
        email: 'user@example.com',
        password: userHashedPassword,
        name: 'Test User',
        role: 'user',
        isPremium: false,
        rating: 4,
        reviewCount: 0,
      });
    }

    return NextResponse.json(
      {
        message: 'Database seeded successfully',
        admin: { email: admin.email, name: admin.name },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
