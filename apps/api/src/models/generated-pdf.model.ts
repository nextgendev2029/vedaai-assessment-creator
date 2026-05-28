import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IGeneratedPdf extends Document {
  assignmentId: mongoose.Types.ObjectId;
  generatedPaperId: mongoose.Types.ObjectId;
  jobId?: string;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  fileName: string;
  contentType: string;
  data?: Buffer;
  size?: number;
  error?: string;
  generatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GeneratedPdfSchema = new Schema<IGeneratedPdf>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    generatedPaperId: { type: Schema.Types.ObjectId, ref: 'GeneratedPaper', required: true, index: true },
    jobId: { type: String },
    status: {
      type: String,
      enum: ['queued', 'processing', 'ready', 'failed'],
      default: 'queued',
      required: true,
    },
    fileName: { type: String, required: true },
    contentType: { type: String, default: 'application/pdf' },
    data: { type: Buffer },
    size: { type: Number },
    error: { type: String },
    generatedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        // Never expose raw buffer in JSON
        delete ret.data;
        return ret;
      },
    },
  },
);

GeneratedPdfSchema.index({ assignmentId: 1, createdAt: -1 });

export const GeneratedPdf: Model<IGeneratedPdf> =
  mongoose.models.GeneratedPdf || mongoose.model<IGeneratedPdf>('GeneratedPdf', GeneratedPdfSchema);
