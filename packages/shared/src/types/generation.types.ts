/** Step in the generation pipeline */
export type GenerationStep =
  | 'queued'
  | 'reading_material'
  | 'building_prompt'
  | 'generating_questions'
  | 'validating_output'
  | 'saving_result'
  | 'completed'
  | 'failed';

/** Job state stored in Redis and sent via WebSocket */
export interface GenerationJobState {
  assignmentId: string;
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  currentStep: GenerationStep;
  resultId?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

/** A single generated question */
export interface GeneratedQuestion {
  id: string;
  text: string;
  type: 'mcq' | 'short_answer' | 'long_answer' | 'case_study';
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
}

/** A section of the generated paper */
export interface GeneratedSection {
  title: string;
  questionType: 'mcq' | 'short_answer' | 'long_answer' | 'case_study';
  instruction: string;
  questions: GeneratedQuestion[];
}

/** Answer key entry */
export interface AnswerKeyEntry {
  questionId: string;
  answer: string;
}

/** Complete generated paper structure */
export interface GeneratedPaperData {
  schoolName: string;
  subject: string;
  className: string;
  topic: string;
  durationMinutes: number;
  maxMarks: number;
  instructions: string;
  sections: GeneratedSection[];
  answerKey: AnswerKeyEntry[];
  generatedBy: 'mock' | 'gemini' | 'groq' | 'mock_fallback' | 'groq_fallback';
}
