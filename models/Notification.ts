import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  type: 'like' | 'comment' | 'follow' | 'share' | 'mention' | 'story_reaction' | 'story_reply';
  postId?: mongoose.Types.ObjectId;
  storyId?: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['like', 'comment', 'follow', 'share', 'mention', 'story_reaction', 'story_reply'],
      required: true
    },
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
    storyId: { type: Schema.Types.ObjectId, ref: 'Story' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = (mongoose.models.Notification as mongoose.Model<INotification>) || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
