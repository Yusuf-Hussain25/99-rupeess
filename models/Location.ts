import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILocation extends Document {
  id: string; // Unique identifier (e.g., "a-h-guard-801101")
  city: string;
  state?: string;
  country: string;
  displayName: string;
  pincode?: number;
  district?: string;
  area?: string; // e.g., "A.H. Guard", "B.C. Road"
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    id: {
      type: String,
      required: [true, 'Location ID is required'],
      unique: true,
      trim: true,
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
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'India',
      trim: true,
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
    },
    pincode: {
      type: Number,
    },
    district: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
LocationSchema.index({ id: 1 }, { unique: true });
LocationSchema.index({ city: 1, area: 1 });
LocationSchema.index({ pincode: 1 });
LocationSchema.index({ isActive: 1 });

const Location: Model<ILocation> = mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);

export default Location;

