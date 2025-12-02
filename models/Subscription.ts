import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // User ID
  stripeCustomerId: string;
  stripePriceId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  planType: 'basic' | 'premium' | 'pro';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stripeCustomerId: { type: String, required: true },
    stripePriceId: { type: String, required: true },
    stripeSubscriptionId: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['active', 'canceled', 'past_due', 'incomplete'],
      default: 'active'
    },
    planType: { 
      type: String, 
      enum: ['basic', 'premium', 'pro'],
      required: true 
    },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    canceledAt: { type: Date },
  },
  { timestamps: true }
);

const Subscription = (mongoose.models.Subscription as mongoose.Model<ISubscription>) || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
export default Subscription;
