import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  interests?: string[];
  visitedCountries?: string[];
  location?: string;
  isPremium: boolean;
  rating: number;
  reviewCount: number;
  followers?: mongoose.Types.ObjectId[];
  following?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String },
    coverPhoto: { type: String },
    bio: { type: String },
    interests: [String],
    visitedCountries: [String],
    location: { type: String },
    isPremium: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
export default User;
