import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import LayoutConfig from '@/models/LayoutConfig';

// GET - Get layout config
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    let config = await LayoutConfig.findOne();
    if (!config) {
      config = await LayoutConfig.create({});
    }

    const populated = await LayoutConfig.findById(config._id)
      .populate('featuredBusinessIds', 'name slug address area')
      .lean();

    return NextResponse.json({ success: true, config: populated }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching layout config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch layout config', details: error.message },
      { status: 500 }
    );
  }
});

// PUT - Update layout config
export const PUT = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const body = await request.json();
    const { leftBarContent, rightBarContent, bottomStripText, bottomStripLink, featuredBusinessIds } = body;

    let config = await LayoutConfig.findOne();
    if (!config) {
      config = await LayoutConfig.create({});
    }

    if (leftBarContent !== undefined) config.leftBarContent = leftBarContent;
    if (rightBarContent !== undefined) config.rightBarContent = rightBarContent;
    if (bottomStripText !== undefined) config.bottomStripText = bottomStripText;
    if (bottomStripLink !== undefined) config.bottomStripLink = bottomStripLink;
    if (featuredBusinessIds !== undefined) config.featuredBusinessIds = featuredBusinessIds;

    await config.save();

    const populated = await LayoutConfig.findById(config._id)
      .populate('featuredBusinessIds', 'name slug address area')
      .lean();

    return NextResponse.json(
      { success: true, config: populated },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating layout config:', error);
    return NextResponse.json(
      { error: 'Failed to update layout config', details: error.message },
      { status: 500 }
    );
  }
});

