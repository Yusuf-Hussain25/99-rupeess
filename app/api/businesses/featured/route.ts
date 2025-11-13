import { NextRequest, NextResponse } from 'next/server';
import type { BusinessSummary } from '@/app/types';

const featured: BusinessSummary[] = [
  {
    id: 'b1',
    name: 'Delicious Bites Restaurant',
    category: 'Restaurant',
    imageUrl: '/Assets/feature shop/restaurant.jpg',
    rating: 4.6,
    reviews: 214,
    city: 'Patna',
    state: 'Bihar',
  },
  {
    id: 'b2',
    name: 'TechZone Electronics',
    category: 'Electronics',
    imageUrl: '/Assets/feature shop/electronic.jpg',
    rating: 4.8,
    reviews: 389,
    city: 'Patna',
    state: 'Bihar',
  },
  {
    id: 'b3',
    name: 'Elegance Salon & Spa',
    category: 'Beauty',
    imageUrl: '/Assets/feature shop/beauty.jpg',
    rating: 4.7,
    reviews: 172,
    city: 'Patna',
    state: 'Bihar',
  },
  {
    id: 'b4',
    name: 'HomeCraft Decor Studio',
    category: 'Home Decor',
    imageUrl: '/Assets/feature shop/homedecor.jpg',
    rating: 4.5,
    reviews: 96,
    city: 'Patna',
    state: 'Bihar',
  },
  {
    id: 'b5',
    name: 'Golden Crust Bakery',
    category: 'Bakery',
    imageUrl: '/Assets/feature shop/bakery.jpg',
    rating: 4.4,
    reviews: 145,
    city: 'Patna',
    state: 'Bihar',
  },
  {
    id: 'b6',
    name: 'ProMotion Sports Store',
    category: 'Sports Shop',
    imageUrl: '/Assets/feature shop/sports shop.jpg',
    rating: 4.6,
    reviews: 201,
    city: 'Patna',
    state: 'Bihar',
  },
];

export async function GET(req: NextRequest) {
  return NextResponse.json({ businesses: featured });
}
