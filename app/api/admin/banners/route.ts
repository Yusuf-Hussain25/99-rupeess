import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Banner from '@/models/Banner';

// GET - Fetch all banners with filters
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const section = searchParams.get('section');
    const area = searchParams.get('area');
    const pincode = searchParams.get('pincode');
    const locationId = searchParams.get('locationId');
    const isActive = searchParams.get('isActive');

    // Build query
    const query: any = {};
    if (section) query.section = section;
    if (area) query.area = area;
    if (pincode) query.pincode = parseInt(pincode);
    if (locationId) query.locationId = locationId;
    if (isActive !== null) query.isActive = isActive === 'true';

    const banners = await Banner.find(query)
      .sort({ section: 1, order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, banners }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners', details: error.message },
      { status: 500 }
    );
  }
});

// POST - Create new banner
export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const body = await request.json();
    const {
      section,
      imageUrl,
      title,
      cta,
      ctaText,
      linkUrl,
      alt,
      advertiser,
      sponsored,
      position,
      area,
      pincode,
      locationId,
      lat,
      lng,
      isActive,
      order,
    } = body;

    // Validation
    if (!section || !imageUrl) {
      return NextResponse.json(
        { error: 'Section and imageUrl are required' },
        { status: 400 }
      );
    }

    // Get max order for this section if order not provided
    let bannerOrder = order;
    if (bannerOrder === undefined || bannerOrder === null) {
      const maxOrderBanner = await Banner.findOne({ section })
        .sort({ order: -1 })
        .select('order')
        .lean();
      bannerOrder = maxOrderBanner ? (maxOrderBanner.order || 0) + 1 : 0;
    }

    const bannerData = {
      section,
      imageUrl,
      title,
      cta,
      ctaText,
      linkUrl: linkUrl || '#',
      alt,
      advertiser,
      sponsored: sponsored || false,
      position,
      area,
      pincode: pincode ? parseInt(pincode) : undefined,
      locationId,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      isActive: isActive !== undefined ? isActive : true,
      order: bannerOrder,
    };

    const banner = await Banner.create(bannerData);

    return NextResponse.json(
      { success: true, banner },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating banner:', error);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Return more detailed error information
    let errorMessage = 'Failed to create banner';
    let errorDetails = error.message;
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error';
      errorDetails = Object.values(error.errors || {})
        .map((err: any) => `${err.path}: ${err.message}`)
        .join(', ');
      console.error('Validation errors:', error.errors);
    } else if (error.code === 11000) {
      errorMessage = 'Duplicate entry';
      errorDetails = 'A banner with these details already exists';
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage, 
        details: errorDetails,
        fullError: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
});

