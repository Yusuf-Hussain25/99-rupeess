import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Category from '@/models/Category';

// Category data based on the folder structure and image mappings
const categoriesToSeed = [
  { slug: 'restaurants', name: 'Restaurants', description: 'Discover the best restaurants and dining experiences', imageUrl: '/Assets/catagory/Restaurants.jpeg' },
  { slug: 'hotels', name: 'Hotels', description: 'Find hotels and accommodations for your stay', imageUrl: '/Assets/catagory/Hotel.jpeg' },
  { slug: 'beauty-spa', name: 'Beauty Spa', description: 'Beauty salons, spas, and wellness centers', imageUrl: '/Assets/catagory/beautyspa.jpeg' },
  { slug: 'home-decor', name: 'Home Decor', description: 'Furniture, home decoration, and interior design', imageUrl: '/Assets/catagory/home-decor.jpeg' },
  { slug: 'wedding-planning', name: 'Wedding Planning', description: 'Wedding planners, venues, and services', imageUrl: '/Assets/catagory/wedding planning.jpeg' },
  { slug: 'education', name: 'Education', description: 'Schools, coaching centers, and educational institutions', imageUrl: '/Assets/catagory/education.jpeg' },
  { slug: 'rent-hire', name: 'Rent & Hire', description: 'Rental services and equipment hire', imageUrl: '/Assets/catagory/rent-hire.jpeg' },
  { slug: 'hospitals', name: 'Hospitals', description: 'Hospitals, clinics, and healthcare facilities', imageUrl: '/Assets/catagory/hospital.jpeg' },
  { slug: 'contractors', name: 'Contractors', description: 'Construction contractors and builders', imageUrl: '/Assets/catagory/constructor.jpeg' },
  { slug: 'pet-shops', name: 'Pet Shops', description: 'Pet stores, veterinary services, and pet care', imageUrl: '/Assets/catagory/pet-shop.jpeg' },
  { slug: 'pg-hostels', name: 'PG/Hostels', description: 'PG accommodations and hostels', imageUrl: '/Assets/catagory/pg-hostel.jpeg' },
  { slug: 'estate-agent', name: 'Estate Agent', description: 'Real estate agents and property services', imageUrl: '/Assets/catagory/estate-agent.jpeg' },
  { slug: 'dentists', name: 'Dentists', description: 'Dental clinics and oral healthcare', imageUrl: '/Assets/catagory/dentist.jpeg' },
  { slug: 'gym', name: 'Gym', description: 'Gyms, fitness centers, and workout facilities', imageUrl: '/Assets/catagory/gym weight room.jpeg' },
  { slug: 'loans', name: 'Loans', description: 'Loan services and financial assistance', imageUrl: '/Assets/catagory/loan.jpeg' },
  { slug: 'event-organisers', name: 'Event Organisers', description: 'Event planning and management services', imageUrl: '/Assets/catagory/event organiser.com_corporate-team-building' },
  { slug: 'driving-schools', name: 'Driving Schools', description: 'Driving schools and training centers', imageUrl: '/Assets/catagory/driving-school.jpeg' },
  { slug: 'packers-movers', name: 'Packers & Movers', description: 'Packing and moving services', imageUrl: '/Assets/catagory/constructor.jpeg' },
  { slug: 'courier-service', name: 'Courier Service', description: 'Courier and delivery services', imageUrl: '/Assets/catagory/courier-series' },
];

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const results = {
      created: [] as string[],
      updated: [] as string[],
      skipped: [] as string[],
      errors: [] as string[],
    };

    for (const categoryData of categoriesToSeed) {
      try {
        // Check if category already exists
        const existing = await Category.findOne({ slug: categoryData.slug });

        if (existing) {
          // Update existing category
          existing.name = categoryData.name;
          existing.description = categoryData.description;
          existing.imageUrl = categoryData.imageUrl;
          existing.isActive = true;
          await existing.save();
          results.updated.push(categoryData.slug);
        } else {
          // Create new category
          await Category.create({
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description,
            imageUrl: categoryData.imageUrl,
            isActive: true,
          });
          results.created.push(categoryData.slug);
        }
      } catch (error: any) {
        console.error(`Error processing category ${categoryData.slug}:`, error);
        results.errors.push(`${categoryData.slug}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Categories seeded successfully',
      results: {
        created: results.created.length,
        updated: results.updated.length,
        errors: results.errors.length,
        details: results,
      },
    });
  } catch (error: any) {
    console.error('Error seeding categories:', error);
    return NextResponse.json(
      { error: 'Failed to seed categories', details: error.message },
      { status: 500 }
    );
  }
});

