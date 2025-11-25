import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShop extends Document {
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
  // Location coordinates
  latitude: number; // Required for distance calculation
  longitude: number; // Required for distance calculation
  // Additional fields
  description?: string;
  offerPercent?: number;
  priceLevel?: string;
  tags?: string[];
  featured?: boolean;
  sponsored?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180,
    },
    description: {
      type: String,
      trim: true,
    },
    offerPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    priceLevel: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sponsored: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
ShopSchema.index({ latitude: 1, longitude: 1 }); // Geospatial index
ShopSchema.index({ category: 1 });
ShopSchema.index({ city: 1 });
ShopSchema.index({ featured: 1 });
ShopSchema.index({ rating: -1 });

const Shop: Model<IShop> = mongoose.models.Shop || mongoose.model<IShop>('Shop', ShopSchema);

export default Shop;

