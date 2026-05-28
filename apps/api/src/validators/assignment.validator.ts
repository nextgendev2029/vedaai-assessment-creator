import { z } from 'zod';

/* ─── Question config (backend) ──────────────────────────────────────────── */

const QuestionConfigInputSchema = z.object({
  type: z.enum(['mcq', 'short_answer', 'long_answer', 'case_study']),
  count: z.number().int().min(1).max(50),
  marks: z.number().int().min(1).max(100),
});

/* ─── Create assignment input ────────────────────────────────────────────── */

export const CreateAssignmentSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  subject: z.string().trim().min(1, 'Subject is required').max(100),
  className: z.string().trim().min(1, 'Class is required').max(50),
  topic: z.string().trim().min(1, 'Topic is required').max(200),
  dueDate: z.string().min(1, 'Due date is required'),
  durationMinutes: z
    .number()
    .int()
    .min(15, 'Duration must be at least 15 minutes')
    .max(300, 'Duration must be at most 300 minutes')
    .optional()
    .nullable()
    .transform((v) => v ?? undefined),
  instructions: z.string().max(5000).optional().nullable().transform((v) => v ?? undefined),
  questionConfigs: z
    .array(QuestionConfigInputSchema)
    .min(1, 'At least one question type is required')
    .max(20),
});

export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;

/* ─── Update assignment input (partial) ──────────────────────────────────── */

export const UpdateAssignmentSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  subject: z.string().trim().min(1).max(100).optional(),
  className: z.string().trim().min(1).max(50).optional(),
  topic: z.string().trim().min(1).max(200).optional(),
  dueDate: z.string().min(1).optional(),
  durationMinutes: z.number().int().min(15).max(300).optional().nullable().transform((v) => v ?? undefined),
  instructions: z.string().max(5000).optional().nullable().transform((v) => v ?? undefined),
  questionConfigs: z.array(QuestionConfigInputSchema).min(1).max(20).optional(),
});

export type UpdateAssignmentInput = z.infer<typeof UpdateAssignmentSchema>;

/* ─── Query params ───────────────────────────────────────────────────────── */

export const ListAssignmentsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['draft', 'queued', 'processing', 'completed', 'failed']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListAssignmentsQuery = z.infer<typeof ListAssignmentsQuerySchema>;
