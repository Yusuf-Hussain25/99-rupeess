import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';

// GET - Fetch all shops (public endpoint for shop coordinates)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const shops = await Shop.find({})
      .select('name latitude longitude')
      .lean();

    // Transform to match the expected format
    const shopData = shops.map(shop => ({
      name: shop.name,
      lat: shop.latitude,
      lng: shop.longitude,
    }));

    return NextResponse.json({ success: true, shops: shopData }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching shops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shops', details: error.message },
      { status: 500 }
    );
  }
}


