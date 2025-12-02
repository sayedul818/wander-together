import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from '@/models/User';

const MONGODB_URI = 'mongodb+srv://sayed:12345@cluster1.bmyln.mongodb.net/travelBuddy?retryWrites=true&w=majority&appName=Cluster1';

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@travelbuddy.com' });
    if (adminExists) {
      console.log('✓ Admin user already exists');
      await mongoose.connection.close();
      return;
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

    console.log('✓ Admin user created successfully');
    console.log('Email: admin@travelbuddy.com');
    console.log('Password: admin123');

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
      console.log('✓ Test user created');
      console.log('Email: user@example.com');
      console.log('Password: user123');
    }

    await mongoose.connection.close();
    console.log('\n✓ Database seeding completed!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdminUser();
