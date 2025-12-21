import mongoose, { Schema, Document } from 'mongoose';

export interface IStoryReaction {
  userId: mongoose.Types.ObjectId;
  type: 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';
  createdAt: Date;
}

export interface IStoryReply {
  userId: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface IStory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  image: string;
  text?: string;
  location?: string;
  views: mongoose.Types.ObjectId[];
  reactions?: IStoryReaction[];
  replies?: IStoryReply[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StoryReactionSchema = new Schema<IStoryReaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'],
      required: true,
    },
  },
  { timestamps: true }
);

const StoryReplySchema = new Schema<IStoryReply>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StorySchema = new Schema<IStory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, required: true },
    text: String,
    location: String,
    views: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    reactions: [StoryReactionSchema],
    replies: [StoryReplySchema],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

if (mongoose.models.Story) {
  delete mongoose.models.Story;
}

const Story = mongoose.model<IStory>('Story', StorySchema);
export default Story;
