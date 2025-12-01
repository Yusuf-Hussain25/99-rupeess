import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  description?: string;
  businessId?: Types.ObjectId;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
OfferSchema.index({ businessId: 1 });
OfferSchema.index({ isActive: 1 });
OfferSchema.index({ startDate: 1, endDate: 1 });

const Offer: Model<IOffer> = mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer;

