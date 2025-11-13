import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, position } = body;

    // In a real app, save to analytics database
    console.log('Offer click tracked:', { offerId, position, timestamp: new Date() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking offer click:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

