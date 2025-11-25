import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { sendOTPEmail } from '@/lib/email';
import OTP from '@/models/OTP';
import User from '@/models/User';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Signup endpoint - Sends OTP to user's email
 * User must verify OTP using /api/auth/verify-otp to complete registration
 */
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();
    const { name, email, password, phone } = body;

    // Validation
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Name, email, password, and phone number are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Normalize phone number (ensure +91 prefix)
    let normalizedPhone = phone?.trim() || '';
    if (normalizedPhone && !normalizedPhone.startsWith('+91')) {
      // Remove any existing + or country code
      normalizedPhone = normalizedPhone.replace(/^\+?91\s*/, '').replace(/^\+/, '');
      // Add +91 prefix
      normalizedPhone = '+91' + normalizedPhone.replace(/\D/g, '');
    } else if (normalizedPhone) {
      normalizedPhone = normalizedPhone.replace(/\D/g, '');
      if (normalizedPhone.startsWith('91')) {
        normalizedPhone = '+' + normalizedPhone;
      } else {
        normalizedPhone = '+91' + normalizedPhone;
      }
    }

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email: normalizedEmail });
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists. Please login instead.' },
        { status: 409 }
      );
    }

    // Check if user already exists by phone
    if (normalizedPhone) {
      const existingUserByPhone = await User.findOne({ phone: normalizedPhone });
      if (existingUserByPhone) {
        return NextResponse.json(
          { error: 'User with this phone number already exists. Please login instead.' },
          { status: 409 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ 
      email: normalizedEmail, 
      type: 'signup',
      verified: false 
    });

    // Create new OTP
    const otpDoc = await OTP.create({
      email: normalizedEmail,
      otp,
      type: 'signup',
      expiresAt,
      verified: false,
    });

    // Store user data temporarily (you can use a separate collection or include in OTP)
    // For now, we'll store it in the verify-otp step
    // Send OTP email
    try {
      await sendOTPEmail({
        email: normalizedEmail,
        otp,
        name: name.trim(),
        type: 'signup',
      });
    } catch (emailError: any) {
      // Delete OTP if email fails
      await OTP.findByIdAndDelete(otpDoc._id);
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please check your email service configuration.', details: emailError.message },
        { status: 500 }
      );
    }

    // Return success - user needs to verify OTP
    // Store signup data temporarily (in production, use Redis or database)
    // For now, we'll require user to send name, password again in verify-otp
    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent to your email. Please verify to complete registration.',
        expiresIn: 600, // 10 minutes in seconds
        // Note: In production, you might want to return a temporary token
        // to securely pass signup data to verify-otp endpoint
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);

    // Provide user-friendly error messages
    if (error.message?.includes('MongoDB Connection Failed')) {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: error.message,
          hint: 'Please check your MongoDB Atlas configuration and IP whitelist settings.'
        },
        { status: 503 } // Service Unavailable
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}


