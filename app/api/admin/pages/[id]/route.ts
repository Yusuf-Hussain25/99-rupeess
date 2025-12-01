import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Page from '@/models/Page';

// GET, PUT, DELETE for single page
export const GET = requireAdmin(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const page = await Page.findById(params.id).lean();
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    return NextResponse.json({ success: true, page }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch page', details: error.message }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const body = await request.json();
    const { title, slug, content, seoTitle, seoDescription, isPublished } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const page = await Page.findByIdAndUpdate(params.id, updateData, { new: true, runValidators: true });
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    return NextResponse.json({ success: true, page }, { status: 200 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Page with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update page', details: error.message }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const page = await Page.findByIdAndDelete(params.id);
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Page deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete page', details: error.message }, { status: 500 });
  }
});

