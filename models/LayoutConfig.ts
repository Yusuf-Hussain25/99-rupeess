import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILeftBarItem {
  title: string;
  link: string;
  imageUrl?: string;
  order?: number;
}

export interface IRightBarItem {
  title: string;
  link: string;
  imageUrl?: string;
  order?: number;
}

export interface ILayoutConfig extends Document {
  leftBarContent: ILeftBarItem[];
  rightBarContent: IRightBarItem[];
  bottomStripText: string;
  bottomStripLink?: string;
  featuredBusinessIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const LeftBarItemSchema = new Schema<ILeftBarItem>({
  title: { type: String, required: true, trim: true },
  link: { type: String, required: true, trim: true },
  imageUrl: { type: String, trim: true },
  order: { type: Number, default: 0 },
}, { _id: false });

const RightBarItemSchema = new Schema<IRightBarItem>({
  title: { type: String, required: true, trim: true },
  link: { type: String, required: true, trim: true },
  imageUrl: { type: String, trim: true },
  order: { type: Number, default: 0 },
}, { _id: false });

const LayoutConfigSchema = new Schema<ILayoutConfig>(
  {
    leftBarContent: {
      type: [LeftBarItemSchema],
      default: [],
    },
    rightBarContent: {
      type: [RightBarItemSchema],
      default: [],
    },
    bottomStripText: {
      type: String,
      default: '',
      trim: true,
    },
    bottomStripLink: {
      type: String,
      trim: true,
    },
    featuredBusinessIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Business',
    }],
  },
  {
    timestamps: true,
  }
);

// Ensure only one document exists
LayoutConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

const LayoutConfig: Model<ILayoutConfig> = mongoose.models.LayoutConfig || mongoose.model<ILayoutConfig>('LayoutConfig', LayoutConfigSchema);

export default LayoutConfig;

