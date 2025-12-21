import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  reason: string;
  details?: string;
  status: 'open' | 'reviewed' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    details: { type: String },
    status: { type: String, enum: ['open', 'reviewed', 'dismissed'], default: 'open' },
  },
  { timestamps: true }
);

const Report = (mongoose.models.Report as mongoose.Model<IReport>) || mongoose.model<IReport>('Report', ReportSchema);
export default Report;
