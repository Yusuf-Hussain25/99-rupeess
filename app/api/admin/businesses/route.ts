import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Business from '@/models/Business';
import Category from '@/models/Category';

// GET - List all businesses
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const isFeatured = searchParams.get('isFeatured');

    const query: any = {};
    if (categoryId) query.categoryId = categoryId;
    if (isFeatured !== null) query.isFeatured = isFeatured === 'true';

    const businesses = await Business.find(query)
      .populate('categoryId', 'name slug')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ success: true, businesses }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses', details: error.message },
      { status: 500 }
    );
  }
});

// POST - Create new business
export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const body = await request.json();
    const { name, slug, categoryId, address, pincode, area, imageUrl, latitude, longitude, isFeatured } = body;

    if (!name || !categoryId || !address || !pincode || !area) {
      return NextResponse.json(
        { error: 'Name, category, address, pincode, and area are required' },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Auto-generate slug if not provided
    let businessSlug = slug || name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existing = await Business.findOne({ slug: businessSlug });
    if (existing) {
      businessSlug = `${businessSlug}-${Date.now()}`;
    }

    const business = await Business.create({
      name,
      slug: businessSlug,
      categoryId,
      address,
      pincode,
      area,
      imageUrl,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      isFeatured: isFeatured || false,
    });

    const populated = await Business.findById(business._id).populate('categoryId', 'name slug').lean();

    return NextResponse.json(
      { success: true, business: populated },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating business:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Business with this slug already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create business', details: error.message },
      { status: 500 }
    );
  }
});

