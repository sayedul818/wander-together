import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId; // User ID
  target: mongoose.Types.ObjectId; // User ID being reviewed
  travelPlan?: mongoose.Types.ObjectId; // TravelPlan ID
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    target: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    travelPlan: { type: Schema.Types.ObjectId, ref: 'TravelPlan' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const Review = (mongoose.models.Review as mongoose.Model<IReview>) || mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
