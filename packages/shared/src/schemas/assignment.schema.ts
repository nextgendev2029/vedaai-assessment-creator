import { z } from 'zod';

/** Difficulty level for a question. */
export const QuestionDifficultySchema = z.enum(['easy', 'medium', 'hard']);

/** Supported question formats. */
export const QuestionTypeSchema = z.enum([
  'mcq',
  'short_answer',
  'long_answer',
  'case_study',
]);

/** Lifecycle status of an assignment as it moves through the generation pipeline. */
export const AssignmentStatusSchema = z.enum([
  'draft',
  'queued',
  'processing',
  'completed',
  'failed',
]);

/**
 * Configuration for a single block of questions that share the same
 * type and difficulty level.
 */
export const QuestionConfigSchema = z.object({
  /** The format of the questions in this block. */
  type: QuestionTypeSchema,
  /** How challenging the questions should be. */
  difficulty: QuestionDifficultySchema.optional().default('medium'),
  /** Number of questions to generate (1–50). */
  count: z.number().int().min(1).max(50),
  /** Marks per question (1–100). */
  marks: z.number().int().min(1).max(100).optional().default(1),
});

/**
 * Validated input payload for creating a new assignment.
 *
 * All string fields are trimmed-safe via min(1) to reject blank values.
 */
export const AssignmentCreateInputSchema = z.object({
  /** Human-readable title for the assignment (max 200 chars). */
  title: z.string().min(1).max(200),
  /** Academic subject, e.g. "Mathematics" (max 100 chars). */
  subject: z.string().min(1).max(100),
  /** Target grade or class level, e.g. "Grade 10" (max 50 chars). */
  gradeLevel: z.string().min(1).max(50),
  /** Class name, e.g. "10-A" (max 50 chars). */
  className: z.string().min(1).max(50).optional(),
  /** Specific topic within the subject, e.g. "Quadratic Equations" (max 200 chars). */
  topic: z.string().min(1).max(200),
  /** Due date in DD-MM-YYYY format. */
  dueDate: z.string().min(1).optional(),
  /** Duration in minutes (15–300). */
  durationMinutes: z.number().int().min(15).max(300).optional(),
  /** One or more question blocks to generate (1–20 blocks). */
  questions: z.array(QuestionConfigSchema).min(1).max(20),
  /** Free-form instructions for the AI generator (max 1000 chars, optional). */
  additionalInstructions: z.string().max(1000).optional(),
});
