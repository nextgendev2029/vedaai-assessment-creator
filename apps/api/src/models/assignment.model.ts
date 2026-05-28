import mongoose, { Schema, type Document, type Model } from 'mongoose';

/* ─── Sub-document interfaces ────────────────────────────────────────────── */

export interface IQuestionConfig {
  type: 'mcq' | 'short_answer' | 'long_answer' | 'case_study';
  count: number;
  marks: number;
}

export interface ISourceMaterial {
  fileName?: string;
  mimeType?: string;
  size?: number;
  extractedText?: string;
}

/* ─── Main document interface ────────────────────────────────────────────── */

export interface IAssignment extends Document {
  title: string;
  subject: string;
  className: string;
  topic: string;
  dueDate: Date;
  durationMinutes?: number;
  instructions?: string;
  questionConfigs: IQuestionConfig[];
  totalQuestions: number;
  totalMarks: number;
  status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed';
  sourceMaterial?: ISourceMaterial;
  latestJobId?: string;
  generationStartedAt?: Date;
  generationCompletedAt?: Date;
  generationError?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ─── Sub-schemas ────────────────────────────────────────────────────────── */

const QuestionConfigSubSchema = new Schema<IQuestionConfig>(
  {
    type: {
      type: String,
      enum: ['mcq', 'short_answer', 'long_answer', 'case_study'],
      required: true,
    },
    count: { type: Number, required: true, min: 1, max: 50 },
    marks: { type: Number, required: true, min: 1, max: 100 },
  },
  { _id: false },
);

const SourceMaterialSubSchema = new Schema<ISourceMaterial>(
  {
    fileName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    extractedText: { type: String },
  },
  { _id: false },
);

/* ─── Main schema ────────────────────────────────────────────────────────── */

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    durationMinutes: { type: Number, min: 15, max: 300 },
    instructions: { type: String, trim: true, maxlength: 5000 },
    questionConfigs: {
      type: [QuestionConfigSubSchema],
      required: true,
      validate: [(v: IQuestionConfig[]) => v.length >= 1, 'At least one question config is required'],
    },
    totalQuestions: { type: Number, required: true, min: 0 },
    totalMarks: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['draft', 'queued', 'processing', 'completed', 'failed'],
      default: 'draft',
    },
    sourceMaterial: { type: SourceMaterialSubSchema },
    latestJobId: { type: String },
    generationStartedAt: { type: Date },
    generationCompletedAt: { type: Date },
    generationError: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

/* ─── Indexes ────────────────────────────────────────────────────────────── */

AssignmentSchema.index({ status: 1 });
AssignmentSchema.index({ createdAt: -1 });
AssignmentSchema.index({ title: 'text', subject: 'text', topic: 'text' });

/* ─── Export ─────────────────────────────────────────────────────────────── */

export const Assignment: Model<IAssignment> =
  mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);
