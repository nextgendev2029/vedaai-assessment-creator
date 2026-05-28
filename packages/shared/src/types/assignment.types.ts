import type { z } from 'zod';

import type {
  QuestionDifficultySchema,
  QuestionTypeSchema,
  AssignmentStatusSchema,
  QuestionConfigSchema,
  AssignmentCreateInputSchema,
} from '../schemas/assignment.schema';

/** Difficulty level – inferred from {@link QuestionDifficultySchema}. */
export type QuestionDifficulty = z.infer<typeof QuestionDifficultySchema>;

/** Question format – inferred from {@link QuestionTypeSchema}. */
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

/** Assignment lifecycle status – inferred from {@link AssignmentStatusSchema}. */
export type AssignmentStatus = z.infer<typeof AssignmentStatusSchema>;

/** Configuration for a question block – inferred from {@link QuestionConfigSchema}. */
export type QuestionConfig = z.infer<typeof QuestionConfigSchema>;

/** Create-assignment request body – inferred from {@link AssignmentCreateInputSchema}. */
export type AssignmentCreateInput = z.infer<typeof AssignmentCreateInputSchema>;
