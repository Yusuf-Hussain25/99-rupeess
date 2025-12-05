import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBanner extends Document {
  section: 'hero' | 'left' | 'right' | 'top' | 'bottom' | 'slider' | 'latest-offers' | 'featured-businesses' | 'top-rated-businesses' | 'new-businesses';
  imageUrl: string;
  title?: string;
  cta?: string;
  ctaText?: string;
  linkUrl: string;
  alt?: string;
  advertiser?: string;
  sponsored: boolean;
  position?: number;
  // Business data fields
  rating?: number; // Business rating (0-5)
  reviews?: number; // Number of reviews
  // Location-based fields
  area?: string; // e.g., "A.H. Guard", "B.C. Road"
  pincode?: number;
  locationId?: string; // Reference to location
  // Shop coordinates for distance calculation
  lat?: number;
  lng?: number;
  // Active status
  isActive: boolean;
  // Order/priority for sorting
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    section: {
      type: String,
      required: [true, 'Section is required'],
      enum: ['hero', 'left', 'right', 'top', 'bottom', 'slider', 'latest-offers', 'featured-businesses', 'top-rated-businesses', 'new-businesses'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    title: {
      type: String,
      trim: true,
    },
    cta: {
      type: String,
      trim: true,
    },
    ctaText: {
      type: String,
      trim: true,
    },
    linkUrl: {
      type: String,
      required: [true, 'Link URL is required'],
      default: '#',
    },
    alt: {
      type: String,
      trim: true,
    },
    advertiser: {
      type: String,
      trim: true,
    },
    sponsored: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      min: 0,
    },
    position: {
      type: Number,
      min: 0,
    },
    area: {
      type: String,
      trim: true,
    },
    pincode: {
      type: Number,
    },
    locationId: {
      type: String,
      trim: true,
    },
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
BannerSchema.index({ section: 1, isActive: 1, order: 1 });
BannerSchema.index({ area: 1, pincode: 1 });
BannerSchema.index({ locationId: 1 });

const Banner: Model<IBanner> = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;

