import mongoose, { Schema, Document } from 'mongoose';

export interface IReaction {
  userId: mongoose.Types.ObjectId;
  type: 'like' | 'love' | 'wow' | 'adventure';
  createdAt: Date;
}

export interface IComment {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  replies?: IComment[];
  likes?: mongoose.Types.ObjectId[];
}

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  postType: 'text' | 'image' | 'video' | 'memory';
  images?: string[];
  videoUrl?: string;
  location?: string;
  tripId?: mongoose.Types.ObjectId;
  reactions?: IReaction[];
  comments?: IComment[];
  shares?: mongoose.Types.ObjectId[];
  privacy: 'public' | 'friends' | 'trip-members' | 'private';
  edited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<IReaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['like', 'love', 'wow', 'adventure'], 
      required: true 
    },
  },
  { timestamps: true }
);

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    replies: [],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const PostSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    postType: { 
      type: String, 
      enum: ['text', 'image', 'video', 'memory'],
      default: 'text',
      required: true 
    },
    images: [String],
    videoUrl: String,
    location: String,
    tripId: { type: Schema.Types.ObjectId, ref: 'TravelPlan' },
    reactions: [ReactionSchema],
    comments: [CommentSchema],
    shares: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    privacy: { 
      type: String, 
      enum: ['public', 'friends', 'trip-members', 'private'],
      default: 'public'
    },
    edited: { type: Boolean, default: false },
    editedAt: Date,
  },
  { timestamps: true }
);

const Post = (mongoose.models.Post as mongoose.Model<IPost>) || mongoose.model<IPost>('Post', PostSchema);
export default Post;
