import { NextRequest, NextResponse } from 'next/server';
import type { Category } from '@/app/types';

// Mock data - replace with actual database query
const mockCategories: Category[] = [
  { id: '1', slug: 'restaurants', displayName: 'Restaurants', itemCount: 124, sponsored: false },
  { id: '2', slug: 'hotels', displayName: 'Hotels', itemCount: 89, sponsored: false },
  { id: '3', slug: 'beauty-spa', displayName: 'Beauty Spa', itemCount: 156, sponsored: false },
  { id: '4', slug: 'home-decor', displayName: 'Home Decor', itemCount: 78, sponsored: false },
  { id: '5', slug: 'wedding-planning', displayName: 'Wedding Planning', itemCount: 45, sponsored: true },
  { id: '6', slug: 'education', displayName: 'Education', itemCount: 112, sponsored: false },
  { id: '7', slug: 'rent-hire', displayName: 'Rent & Hire', itemCount: 67, sponsored: false },
  { id: '8', slug: 'hospitals', displayName: 'Hospitals', itemCount: 34, sponsored: false },
  { id: '9', slug: 'contractors', displayName: 'Contractors', itemCount: 56, sponsored: false },
  { id: '10', slug: 'pet-shops', displayName: 'Pet Shops', itemCount: 43, sponsored: false },
  { id: '11', slug: 'pg-hostels', displayName: 'PG/Hostels', itemCount: 98, sponsored: false },
  { id: '12', slug: 'estate-agent', displayName: 'Estate Agent', itemCount: 76, sponsored: false },
  { id: '13', slug: 'dentists', displayName: 'Dentists', itemCount: 54, sponsored: false },
  { id: '14', slug: 'gym', displayName: 'Gym', itemCount: 87, sponsored: true },
  { id: '15', slug: 'loans', displayName: 'Loans', itemCount: 65, sponsored: false },
  { id: '16', slug: 'event-organisers', displayName: 'Event Organisers', itemCount: 92, sponsored: false },
  { id: '17', slug: 'driving-schools', displayName: 'Driving Schools', itemCount: 41, sponsored: false },
  { id: '18', slug: 'packers-movers', displayName: 'Packers & Movers', itemCount: 58, sponsored: false },
  { id: '19', slug: 'courier-service', displayName: 'Courier Service', itemCount: 73, sponsored: false },
  { id: '20', slug: 'popular-categories', displayName: 'Popular Categories', itemCount: 234, sponsored: false },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const loc = searchParams.get('loc');

  // In a real app, filter by location
  // For now, return all categories
  const categories = mockCategories;

  return NextResponse.json({ categories });
}
