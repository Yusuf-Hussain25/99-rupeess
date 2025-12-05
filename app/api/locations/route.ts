import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Location from '@/models/Location';

// GET - Fetch all active locations (public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const pincode = searchParams.get('pincode');

    const query: any = { isActive: true };
    if (city) query.city = new RegExp(city, 'i');
    if (pincode) query.pincode = parseInt(pincode);

    const locations = await Location.find(query)
      .sort({ city: 1, displayName: 1 })
      .select('id city state country displayName pincode district area latitude longitude')
      .lean();

    return NextResponse.json({ success: true, locations }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations', details: error.message },
      { status: 500 }
    );
  }
}


