/**
 * Mock shop data with coordinates for Patna, Bihar, India
 * Coordinates are approximate locations in Patna
 */
export interface MockShop {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  city: string;
  state?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  description?: string;
  offerPercent?: number;
  priceLevel?: string;
  tags?: string[];
  featured?: boolean;
  sponsored?: boolean;
}

// Patna center coordinates: approximately 25.5941° N, 85.1376° E
export const MOCK_SHOPS: MockShop[] = [
  {
    id: 'shop-1',
    name: 'The Urban Tandoor',
    category: 'Restaurant',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&auto=format&fit=crop',
    rating: 4.8,
    reviews: 368,
    city: 'Patna',
    state: 'Bihar',
    address: 'Fraser Road, Patna',
    phone: '+91 612 2345678',
    latitude: 25.6100,
    longitude: 85.1300,
    description: 'Modern Indian kitchen with charcoal grills, chef tasting menus and skyline seating.',
    offerPercent: 20,
    priceLevel: '₹₹₹',
    tags: ['Fine dining', 'Live music'],
    featured: true,
  },
  {
    id: 'shop-2',
    name: 'Bao & Biryani Co.',
    category: 'Restaurant',
    imageUrl: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=900&auto=format&fit=crop',
    rating: 4.4,
    reviews: 198,
    city: 'Patna',
    state: 'Bihar',
    address: 'Kankarbagh, Patna',
    phone: '+91 612 2345679',
    latitude: 25.6000,
    longitude: 85.1400,
    description: 'Street-style Asian baos meet slow-cooked biryani bowls and craft coolers.',
    offerPercent: 35,
    priceLevel: '₹₹',
    tags: ['Casual dining', 'Asian fusion'],
  },
  {
    id: 'shop-3',
    name: 'TechZone Electronics',
    category: 'Electronics',
    imageUrl: '/Assets/feature shop/electronic.jpg',
    rating: 4.8,
    reviews: 389,
    city: 'Patna',
    state: 'Bihar',
    address: 'Boring Road, Patna',
    phone: '+91 612 2345680',
    latitude: 25.5950,
    longitude: 85.1250,
    description: 'Latest electronics, gadgets, and tech accessories.',
    featured: true,
    tags: ['Electronics', 'Gadgets'],
  },
  {
    id: 'shop-4',
    name: 'Elegance Salon & Spa',
    category: 'Beauty',
    imageUrl: '/Assets/feature shop/beauty.jpg',
    rating: 4.7,
    reviews: 172,
    city: 'Patna',
    state: 'Bihar',
    address: 'Exhibition Road, Patna',
    phone: '+91 612 2345681',
    latitude: 25.6050,
    longitude: 85.1350,
    description: 'Premium salon and spa services for men and women.',
    offerPercent: 25,
    featured: true,
    tags: ['Salon', 'Spa', 'Beauty'],
  },
  {
    id: 'shop-5',
    name: 'HomeCraft Decor Studio',
    category: 'Home Decor',
    imageUrl: '/Assets/feature shop/homedecor.jpg',
    rating: 4.5,
    reviews: 96,
    city: 'Patna',
    state: 'Bihar',
    address: 'Patliputra Colony, Patna',
    phone: '+91 612 2345682',
    latitude: 25.5900,
    longitude: 85.1450,
    description: 'Modern home decor and furniture solutions.',
    featured: true,
    tags: ['Furniture', 'Decor'],
  },
  {
    id: 'shop-6',
    name: 'Golden Crust Bakery',
    category: 'Bakery',
    imageUrl: '/Assets/feature shop/bakery.jpg',
    rating: 4.4,
    reviews: 145,
    city: 'Patna',
    state: 'Bihar',
    address: 'Buddha Colony, Patna',
    phone: '+91 612 2345683',
    latitude: 25.5850,
    longitude: 85.1200,
    description: 'Fresh baked goods, cakes, and pastries.',
    offerPercent: 15,
    tags: ['Bakery', 'Desserts'],
  },
  {
    id: 'shop-7',
    name: 'ProMotion Sports Store',
    category: 'Sports Shop',
    imageUrl: '/Assets/feature shop/sports shop.jpg',
    rating: 4.6,
    reviews: 201,
    city: 'Patna',
    state: 'Bihar',
    address: 'Rajendra Nagar, Patna',
    phone: '+91 612 2345684',
    latitude: 25.6150,
    longitude: 85.1500,
    description: 'Sports equipment and athletic gear.',
    featured: true,
    tags: ['Sports', 'Fitness'],
  },
  {
    id: 'shop-8',
    name: 'Delicious Bites Restaurant',
    category: 'Restaurant',
    imageUrl: '/Assets/feature shop/restaurant.jpg',
    rating: 4.6,
    reviews: 214,
    city: 'Patna',
    state: 'Bihar',
    address: 'Maurya Lok, Patna',
    phone: '+91 612 2345685',
    latitude: 25.6200,
    longitude: 85.1280,
    description: 'Authentic local and international cuisine.',
    offerPercent: 30,
    priceLevel: '₹₹',
    tags: ['Multi-cuisine', 'Family dining'],
  },
  {
    id: 'shop-9',
    name: 'Paw Pantry Collective',
    category: 'Pet Shop',
    imageUrl: 'https://images.unsplash.com/photo-1518378188025-22bd89516ee2?w=900&auto=format&fit=crop',
    rating: 4.8,
    reviews: 164,
    city: 'Patna',
    state: 'Bihar',
    address: 'Sri Krishna Puri, Patna',
    phone: '+91 612 2345686',
    latitude: 25.5800,
    longitude: 85.1320,
    description: 'Air-dried treats, vet-approved meal plans and subscription boxes.',
    offerPercent: 20,
    tags: ['Nutrition', 'Subscriptions'],
  },
  {
    id: 'shop-10',
    name: 'Fur & Feather Spa',
    category: 'Pet Shop',
    imageUrl: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=900&auto=format&fit=crop',
    rating: 4.6,
    reviews: 110,
    city: 'Patna',
    state: 'Bihar',
    address: 'Buddha Colony, Patna',
    phone: '+91 612 2345687',
    latitude: 25.5750,
    longitude: 85.1250,
    description: 'Hydro baths, creative grooming and weekend boarding.',
    tags: ['Grooming', 'Boarding'],
  },
];

