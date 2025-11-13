import { NextRequest, NextResponse } from 'next/server';
import type { Offer } from '@/app/types';

// Mock data - replace with actual database query
const mockOffers: Offer[] = [
  {
    id: '1',
    shopId: 'shop1',
    shopName: 'Urban Outfitters',
    headline: 'Last Chance Summer Sale',
    description: 'Limited time summer styles with up to 30% off on all apparel.',
    discount: '30% OFF',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    cta: 'Shop Now',
    imageUrl: '/Assets/icons/Screenshot 2025-11-13 124054.png',
    sponsored: true,
  },
  {
    id: '2',
    shopId: 'shop2',
    shopName: 'Glow Beauty Studio',
    headline: 'Festive Glam Packages',
    description: 'Bridal & party makeovers starting at ₹1,999. Book a slot today.',
    discount: 'Save ₹500',
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    cta: 'Book Appointment',
    imageUrl: '/Assets/icons/Screenshot 2025-11-13 124022.png',
    sponsored: false,
  },
  {
    id: '3',
    shopId: 'shop3',
    shopName: 'TechBazaar',
    headline: 'Mega Gadget Weekend',
    description: 'Smartphones, laptops & accessories with huge exchange bonus.',
    discount: 'Up to ₹7000 Exchange',
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    cta: 'Upgrade Now',
    imageUrl: '/Assets/icons/Screenshot 2025-11-13 124000.png',
    sponsored: true,
  },
  {
    id: '4',
    shopId: 'shop4',
    shopName: 'FitCore Gym',
    headline: 'New Year Fitness Plans',
    description: 'Annual membership bundled with diet consultation & personal training.',
    discount: 'Flat 25% OFF',
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    cta: 'Join Today',
    imageUrl: '/Assets/icons/Screenshot 2025-11-13 123834.png',
    sponsored: false,
  },
  {
    id: '5',
    shopId: 'shop5',
    shopName: 'Bliss Travel Co.',
    headline: 'Discover Bali Packages',
    description: 'Flight + hotel + activities starting at ₹59,999 per person.',
    discount: 'Bundle Savings',
    expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    cta: 'Plan Trip',
    imageUrl: '/Assets/icons/Screenshot 2025-11-13 123743.png',
    sponsored: false,
  },
  {
    id: '6',
    shopId: 'shop6',
    shopName: 'CityCare Diagnostics',
    headline: 'Comprehensive Health Check',
    description: 'Full body health packages with same-day reports and doctor review.',
    discount: 'Save 35%',
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    cta: 'Schedule Test',
    imageUrl: '/Assets/icons/Screenshot 2025-11-13 123626.png',
    sponsored: true,
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const loc = searchParams.get('loc');
  const cat = searchParams.get('cat');

  // In a real app, filter by location and category
  // For now, return all offers
  const offers = mockOffers;

  return NextResponse.json({ offers });
}

