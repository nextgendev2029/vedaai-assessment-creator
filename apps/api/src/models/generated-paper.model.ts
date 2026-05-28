import mongoose, { Schema, type Document, type Model } from 'mongoose';

interface IGeneratedQuestion {
  id: string;
  text: string;
  type: 'mcq' | 'short_answer' | 'long_answer' | 'case_study';
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
}

interface IGeneratedSection {
  title: string;
  questionType: 'mcq' | 'short_answer' | 'long_answer' | 'case_study';
  instruction: string;
  questions: IGeneratedQuestion[];
}

interface IAnswerKeyEntry {
  questionId: string;
  answer: string;
}

interface IAIMetadata {
  provider: string;
  model?: string;
  promptHash?: string;
  fallbackUsed: boolean;
  validationWarnings: string[];
  generatedAt: string;
}

export interface IGeneratedPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  jobId?: string;
  schoolName: string;
  subject: string;
  className: string;
  topic: string;
  durationMinutes: number;
  maxMarks: number;
  instructions: string;
  sections: IGeneratedSection[];
  answerKey: IAnswerKeyEntry[];
  generatedBy: 'mock' | 'gemini' | 'groq' | 'mock_fallback' | 'groq_fallback';
  aiMetadata?: IAIMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const GeneratedQuestionSubSchema = new Schema<IGeneratedQuestion>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'short_answer', 'long_answer', 'case_study'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    marks: { type: Number, required: true },
    options: { type: [String] },
  },
  { _id: false },
);

const GeneratedSectionSubSchema = new Schema<IGeneratedSection>(
  {
    title: { type: String, required: true },
    questionType: { type: String, enum: ['mcq', 'short_answer', 'long_answer', 'case_study'], required: true },
    instruction: { type: String, required: true },
    questions: { type: [GeneratedQuestionSubSchema], required: true },
  },
  { _id: false },
);

const AnswerKeySubSchema = new Schema<IAnswerKeyEntry>(
  {
    questionId: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const AIMetadataSubSchema = new Schema<IAIMetadata>(
  {
    provider: { type: String, required: true },
    model: { type: String },
    promptHash: { type: String },
    fallbackUsed: { type: Boolean, default: false },
    validationWarnings: { type: [String], default: [] },
    generatedAt: { type: String },
  },
  { _id: false },
);

const GeneratedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    jobId: { type: String },
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    topic: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
    instructions: { type: String, required: true },
    sections: { type: [GeneratedSectionSubSchema], required: true },
    answerKey: { type: [AnswerKeySubSchema], required: true },
    generatedBy: { type: String, enum: ['mock', 'gemini', 'groq', 'mock_fallback', 'groq_fallback'], required: true },
    aiMetadata: { type: AIMetadataSubSchema },
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

GeneratedPaperSchema.index({ assignmentId: 1, createdAt: -1 });

export const GeneratedPaper: Model<IGeneratedPaper> =
  mongoose.models.GeneratedPaper || mongoose.model<IGeneratedPaper>('GeneratedPaper', GeneratedPaperSchema);
