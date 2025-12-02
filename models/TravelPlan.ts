import mongoose, { Schema, Document } from 'mongoose';

export interface ITravelPlan extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  interests: string[];
  maxParticipants: number;
  currentParticipants: number;
  participants: mongoose.Types.ObjectId[]; // User IDs
  creator: mongoose.Types.ObjectId; // User ID
  activities?: string[];
  accommodationType?: string;
  travelStyle?: string;
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TravelPlanSchema = new Schema<ITravelPlan>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number },
    interests: [String],
    maxParticipants: { type: Number, default: 10 },
    currentParticipants: { type: Number, default: 1 },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activities: [String],
    accommodationType: { type: String },
    travelStyle: { type: String },
    status: { 
      type: String, 
      enum: ['planning', 'confirmed', 'completed', 'cancelled'], 
      default: 'planning' 
    },
    image: { type: String },
  },
  { timestamps: true }
);

const TravelPlan = (mongoose.models.TravelPlan as mongoose.Model<ITravelPlan>) || mongoose.model<ITravelPlan>('TravelPlan', TravelPlanSchema);
export default TravelPlan;
