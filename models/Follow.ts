import mongoose, { Schema, Document } from 'mongoose';

export interface IFollow extends Document {
  _id: mongoose.Types.ObjectId;
  followerId: mongoose.Types.ObjectId;
  followingId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    followingId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Index to prevent duplicate follows
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow = (mongoose.models.Follow as mongoose.Model<IFollow>) || mongoose.model<IFollow>('Follow', FollowSchema);
export default Follow;
