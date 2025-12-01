import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import DistanceConfig from '@/models/DistanceConfig';

// GET - Get distance config
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    let config = await DistanceConfig.findOne();
    if (!config) {
      config = await DistanceConfig.create({});
    }

    return NextResponse.json({ success: true, config }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching distance config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch distance config', details: error.message },
      { status: 500 }
    );
  }
});

// PUT - Update distance config
export const PUT = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const body = await request.json();
    const { maxDistanceKm, defaultDistanceKm, distanceUnit } = body;

    let config = await DistanceConfig.findOne();
    if (!config) {
      config = await DistanceConfig.create({});
    }

    if (maxDistanceKm !== undefined) config.maxDistanceKm = parseFloat(maxDistanceKm);
    if (defaultDistanceKm !== undefined) config.defaultDistanceKm = parseFloat(defaultDistanceKm);
    if (distanceUnit !== undefined) config.distanceUnit = distanceUnit;

    await config.save();

    return NextResponse.json(
      { success: true, config },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating distance config:', error);
    return NextResponse.json(
      { error: 'Failed to update distance config', details: error.message },
      { status: 500 }
    );
  }
});

