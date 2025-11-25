import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';

/**
 * GET /api/auth/profile - Get current user profile
 */
export async function GET(request: NextRequest) {
  try {
    const { user: authUser, error } = authenticateRequest(request);
    
    if (!authUser || error) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(authUser.userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/profile - Update user profile
 */
export async function PUT(request: NextRequest) {
  try {
    const { user: authUser, error } = authenticateRequest(request);
    
    if (!authUser || error) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { name, phone } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Find user and include password field for updates
    const user = await User.findById(authUser.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Normalize phone number
    let normalizedPhone = phone?.trim() || '';
    if (normalizedPhone && !normalizedPhone.startsWith('+91')) {
      normalizedPhone = normalizedPhone.replace(/^\+?91\s*/, '').replace(/^\+/, '');
      normalizedPhone = '+91' + normalizedPhone.replace(/\D/g, '');
    } else if (normalizedPhone) {
      normalizedPhone = normalizedPhone.replace(/\D/g, '');
      if (normalizedPhone.startsWith('91')) {
        normalizedPhone = '+' + normalizedPhone;
      } else {
        normalizedPhone = '+91' + normalizedPhone;
      }
    }

    // Check if phone number is already taken by another user
    if (normalizedPhone && normalizedPhone !== user.phone) {
      const existingUserByPhone = await User.findOne({ 
        phone: normalizedPhone,
        _id: { $ne: authUser.userId }
      });
      
      if (existingUserByPhone) {
        return NextResponse.json(
          { error: 'This phone number is already registered with another account' },
          { status: 409 }
        );
      }
    }

    // Update user
    user.name = name.trim();
    if (normalizedPhone) {
      user.phone = normalizedPhone;
    }
    
    await user.save();

    // Return updated user (without password)
    const updatedUser = await User.findById(authUser.userId).select('-password');

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser!._id.toString(),
        name: updatedUser!.name,
        email: updatedUser!.email,
        phone: updatedUser!.phone,
        role: updatedUser!.role,
        isEmailVerified: updatedUser!.isEmailVerified,
        createdAt: updatedUser!.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

