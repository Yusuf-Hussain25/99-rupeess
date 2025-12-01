import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Banner from '@/models/Banner';

// GET - Fetch single banner
export const GET = requireAdmin(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();

    const banner = await Banner.findById(params.id).lean();

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, banner }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banner', details: error.message },
      { status: 500 }
    );
  }
});

// PUT - Update banner
export const PUT = requireAdmin(async (request: NextRequest, { params }: { params: { id: string } }) => {
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

    const updateData: any = {};
    if (section !== undefined) updateData.section = section;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (title !== undefined) updateData.title = title;
    if (cta !== undefined) updateData.cta = cta;
    if (ctaText !== undefined) updateData.ctaText = ctaText;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (alt !== undefined) updateData.alt = alt;
    if (advertiser !== undefined) updateData.advertiser = advertiser;
    if (sponsored !== undefined) updateData.sponsored = sponsored;
    if (position !== undefined) updateData.position = position;
    if (area !== undefined) updateData.area = area;
    if (pincode !== undefined) updateData.pincode = pincode ? parseInt(pincode) : undefined;
    if (locationId !== undefined) updateData.locationId = locationId;
    if (lat !== undefined) updateData.lat = lat ? parseFloat(lat) : undefined;
    if (lng !== undefined) updateData.lng = lng ? parseFloat(lng) : undefined;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = order;

    const banner = await Banner.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, banner },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: 'Failed to update banner', details: error.message },
      { status: 500 }
    );
  }
});

// DELETE - Delete banner
export const DELETE = requireAdmin(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();

    const banner = await Banner.findByIdAndDelete(params.id);

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Banner deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner', details: error.message },
      { status: 500 }
    );
  }
});

