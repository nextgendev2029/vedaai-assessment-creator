import type { GeneratedPaperData } from '@vedaai/shared';

/** Provider identifier */
export type AIProviderName = 'mock' | 'gemini' | 'groq' | 'mock_fallback' | 'groq_fallback';

/** Metadata about the generation process */
export interface AIGenerationMetadata {
  provider: AIProviderName;
  model?: string;
  promptHash?: string;
  fallbackUsed: boolean;
  validationWarnings: string[];
  generatedAt: string;
}

/** Result from the AI generation pipeline */
export interface AIGenerationResult {
  paper: GeneratedPaperData;
  metadata: AIGenerationMetadata;
}

/** Input for paper generation */
export interface PaperGenerationInput {
  title: string;
  subject: string;
  className: string;
  topic: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  instructions?: string;
  questionConfigs: Array<{
    type: 'mcq' | 'short_answer' | 'long_answer' | 'case_study';
    count: number;
    marks: number;
  }>;
  sourceMaterialText?: string;
}
