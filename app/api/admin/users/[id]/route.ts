import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import User from '@/models/User';

// GET - Get single user
export const GET = requireAdmin(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const user = await User.findById(params.id).select('-password').lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch user', details: error.message }, { status: 500 });
  }
});

// PUT - Update user
export const PUT = requireAdmin(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, phone, role, isEmailVerified } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (isEmailVerified !== undefined) updateData.isEmailVerified = isEmailVerified;

    const user = await User.findByIdAndUpdate(params.id, updateData, { new: true, runValidators: true })
      .select('-password');

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email or phone already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update user', details: error.message }, { status: 500 });
  }
});

// DELETE - Delete user
export const DELETE = requireAdmin(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const user = await User.findByIdAndDelete(params.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'User deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete user', details: error.message }, { status: 500 });
  }
});

