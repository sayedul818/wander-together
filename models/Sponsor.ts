import mongoose, { Schema, Document } from 'mongoose';

export interface ISponsor extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  image: string;
  link: string;
  isActive: boolean;
  priority: number; // Higher priority = shown first
  startDate?: Date;
  endDate?: Date;
  clicks: number;
  impressions: number;
  createdAt: Date;
  updatedAt: Date;
}

const SponsorSchema = new Schema<ISponsor>(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    link: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for efficient querying of active sponsors
SponsorSchema.index({ isActive: 1, priority: -1 });

const Sponsor = (mongoose.models.Sponsor as mongoose.Model<ISponsor>) || mongoose.model<ISponsor>('Sponsor', SponsorSchema);
export default Sponsor;
