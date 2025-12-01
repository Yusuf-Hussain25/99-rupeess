import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDistanceConfig extends Document {
  maxDistanceKm: number;
  defaultDistanceKm: number;
  distanceUnit: string;
  createdAt: Date;
  updatedAt: Date;
}

const DistanceConfigSchema = new Schema<IDistanceConfig>(
  {
    maxDistanceKm: {
      type: Number,
      default: 10,
      min: [1, 'Max distance must be at least 1 km'],
    },
    defaultDistanceKm: {
      type: Number,
      default: 5,
      min: [1, 'Default distance must be at least 1 km'],
    },
    distanceUnit: {
      type: String,
      default: 'km',
      enum: ['km', 'miles'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one document exists
DistanceConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

const DistanceConfig: Model<IDistanceConfig> = mongoose.models.DistanceConfig || mongoose.model<IDistanceConfig>('DistanceConfig', DistanceConfigSchema);

export default DistanceConfig;

