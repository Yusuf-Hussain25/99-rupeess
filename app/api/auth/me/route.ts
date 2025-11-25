import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

async function handler(request: NextRequest, user: { userId: string }) {
  try {
    // Connect to database
    await connectDB();

    // Find user by ID
    const userDoc = await User.findById(user.userId);

    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data (without password)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: userDoc._id.toString(),
          name: userDoc.name,
          email: userDoc.email,
          phone: userDoc.phone,
          role: userDoc.role,
          isEmailVerified: userDoc.isEmailVerified,
          createdAt: userDoc.createdAt,
          updatedAt: userDoc.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get user error:', error);

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handler);


