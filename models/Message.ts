import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId; // User ID
  recipient: mongoose.Types.ObjectId; // User ID
  content: string;
  image?: string; // Optional image attachment (for story replies)
  storyId?: mongoose.Types.ObjectId; // Reference to story if this is a story reply
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    image: { type: String }, // Optional image URL
    storyId: { type: Schema.Types.ObjectId, ref: 'Story' }, // Optional story reference
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for faster queries
MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, read: 1 });

const Message = (mongoose.models.Message as mongoose.Model<IMessage>) || mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
