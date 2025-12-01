import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Page from '@/models/Page';

// GET - List all pages
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const isPublished = searchParams.get('isPublished');

    const query: any = {};
    if (isPublished !== null) query.isPublished = isPublished === 'true';

    const pages = await Page.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, pages }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages', details: error.message },
      { status: 500 }
    );
  }
});

// POST - Create new page
export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const body = await request.json();
    const { title, slug, content, seoTitle, seoDescription, isPublished } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Auto-generate slug if not provided
    let pageSlug = slug || title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existing = await Page.findOne({ slug: pageSlug });
    if (existing) {
      pageSlug = `${pageSlug}-${Date.now()}`;
    }

    const page = await Page.create({
      title,
      slug: pageSlug,
      content,
      seoTitle,
      seoDescription,
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    return NextResponse.json(
      { success: true, page },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating page:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Page with this slug already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create page', details: error.message },
      { status: 500 }
    );
  }
});

