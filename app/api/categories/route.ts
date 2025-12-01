import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import type { Category as CategoryType } from '@/app/types';

// Revalidate every 5 minutes
export const revalidate = 300;

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const loc = searchParams.get('loc');

    // Use aggregation pipeline to fetch categories with business counts in a single query
    const categoriesWithCounts = await Category.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'businesses',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'businesses'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          imageUrl: 1,
          itemCount: { $size: '$businesses' }
        }
      },
      { $sort: { name: 1 } }
    ]);

    const formattedCategories: CategoryType[] = categoriesWithCounts.map((cat) => ({
      id: cat._id.toString(),
      slug: cat.slug,
      displayName: cat.name,
      iconUrl: cat.imageUrl || undefined,
      itemCount: cat.itemCount || 0,
      sponsored: false,
    }));

    // If no categories in database, return mock data for development
    if (categoriesWithCounts.length === 0) {
      // Fallback to mock data with proper image URLs
      const mockCategories: CategoryType[] = [
        { id: '1', slug: 'restaurants', displayName: 'Restaurants', iconUrl: '/Assets/catagory/Restaurants.jpeg', itemCount: 0, sponsored: false },
        { id: '2', slug: 'hotels', displayName: 'Hotels', iconUrl: '/Assets/catagory/Hotel.jpeg', itemCount: 0, sponsored: false },
        { id: '3', slug: 'beauty-spa', displayName: 'Beauty Spa', iconUrl: '/Assets/catagory/beautyspa.jpeg', itemCount: 0, sponsored: false },
        { id: '4', slug: 'home-decor', displayName: 'Home Decor', iconUrl: '/Assets/catagory/home-decor.jpeg', itemCount: 0, sponsored: false },
        { id: '5', slug: 'wedding-planning', displayName: 'Wedding Planning', iconUrl: '/Assets/catagory/wedding planning.jpeg', itemCount: 0, sponsored: true },
        { id: '6', slug: 'education', displayName: 'Education', iconUrl: '/Assets/catagory/education.jpeg', itemCount: 0, sponsored: false },
        { id: '7', slug: 'rent-hire', displayName: 'Rent & Hire', iconUrl: '/Assets/catagory/rent-hire.jpeg', itemCount: 0, sponsored: false },
        { id: '8', slug: 'hospitals', displayName: 'Hospitals', iconUrl: '/Assets/catagory/hospital.jpeg', itemCount: 0, sponsored: false },
        { id: '9', slug: 'contractors', displayName: 'Contractors', iconUrl: '/Assets/catagory/constructor.jpeg', itemCount: 0, sponsored: false },
        { id: '10', slug: 'pet-shops', displayName: 'Pet Shops', iconUrl: '/Assets/catagory/pet-shop.jpeg', itemCount: 0, sponsored: false },
        { id: '11', slug: 'pg-hostels', displayName: 'PG/Hostels', iconUrl: '/Assets/catagory/pg-hostel.jpeg', itemCount: 0, sponsored: false },
        { id: '12', slug: 'estate-agent', displayName: 'Estate Agent', iconUrl: '/Assets/catagory/estate-agent.jpeg', itemCount: 0, sponsored: false },
        { id: '13', slug: 'dentists', displayName: 'Dentists', iconUrl: '/Assets/catagory/dentist.jpeg', itemCount: 0, sponsored: false },
        { id: '14', slug: 'gym', displayName: 'Gym', iconUrl: '/Assets/catagory/gym weight room.jpeg', itemCount: 0, sponsored: false },
        { id: '15', slug: 'loans', displayName: 'Loans', iconUrl: '/Assets/catagory/loan.jpeg', itemCount: 0, sponsored: false },
        { id: '16', slug: 'event-organisers', displayName: 'Event Organisers', iconUrl: '/Assets/catagory/event organiser.com_corporate-team-building', itemCount: 0, sponsored: false },
        { id: '17', slug: 'driving-schools', displayName: 'Driving Schools', iconUrl: '/Assets/catagory/driving-school.jpeg', itemCount: 0, sponsored: false },
        { id: '18', slug: 'packers-movers', displayName: 'Packers & Movers', iconUrl: '/Assets/catagory/constructor.jpeg', itemCount: 0, sponsored: false },
        { id: '19', slug: 'courier-service', displayName: 'Courier Service', iconUrl: '/Assets/catagory/courier-series', itemCount: 0, sponsored: false },
      ];
      
      return NextResponse.json({ categories: mockCategories }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      });
    }

    return NextResponse.json({ categories: formattedCategories }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error.message },
      { status: 500 }
    );
  }
}
