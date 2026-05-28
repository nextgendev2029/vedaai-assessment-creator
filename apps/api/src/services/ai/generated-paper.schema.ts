import { z } from 'zod';

/* ─── Sub-schemas ─────────────────────────────────────────────────────────── */

const QuestionTypeEnum = z.enum(['mcq', 'short_answer', 'long_answer', 'case_study']);
const DifficultyEnum = z.enum(['easy', 'medium', 'hard']);

const GeneratedQuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(5, 'Question text too short'),
  type: QuestionTypeEnum,
  difficulty: DifficultyEnum,
  marks: z.number().int().min(1),
  options: z.array(z.string()).optional(),
});

const GeneratedSectionSchema = z.object({
  title: z.string().min(1),
  questionType: QuestionTypeEnum,
  instruction: z.string().min(1),
  questions: z.array(GeneratedQuestionSchema).min(1),
});

const AnswerKeyEntrySchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1),
});

/* ─── Full paper schema ──────────────────────────────────────────────────── */

export const GeneratedPaperSchema = z.object({
  schoolName: z.string().min(1),
  subject: z.string().min(1),
  className: z.string().min(1),
  topic: z.string().min(1),
  durationMinutes: z.number().int().min(1),
  maxMarks: z.number().int().min(1),
  instructions: z.string().min(1),
  sections: z.array(GeneratedSectionSchema).min(1),
  answerKey: z.array(AnswerKeyEntrySchema),
});

export type ValidatedPaper = z.infer<typeof GeneratedPaperSchema>;

/* ─── Validation helpers ─────────────────────────────────────────────────── */

export interface PaperValidationResult {
  valid: boolean;
  paper: ValidatedPaper | null;
  warnings: string[];
  errors: string[];
}

/**
 * Validate and normalize an AI-generated paper.
 * Fixes common issues:
 * - Ensures unique question IDs
 * - Ensures MCQs have 4 options
 * - Ensures question types match section questionType
 * - Ensures answer key covers all questions
 * - Adds default instructions if missing
 */
export function validateAndNormalizePaper(
  raw: unknown,
  expectedTotalMarks: number,
): PaperValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Step 1: Parse with Zod
  const parsed = GeneratedPaperSchema.safeParse(raw);
  if (!parsed.success) {
    const zodErrors = parsed.error.issues.map(
      (i) => `${i.path.join('.')}: ${i.message}`,
    );
    return { valid: false, paper: null, warnings, errors: zodErrors };
  }

  const paper = parsed.data;

  // Step 2: Ensure unique question IDs
  const seenIds = new Set<string>();
  let globalIdx = 1;
  for (const section of paper.sections) {
    for (const q of section.questions) {
      if (seenIds.has(q.id)) {
        q.id = `q-${globalIdx}`;
        warnings.push(`Duplicate question ID fixed: reassigned to ${q.id}`);
      }
      seenIds.add(q.id);
      globalIdx++;
    }
  }

  // Step 3: Ensure question types match section
  for (const section of paper.sections) {
    for (const q of section.questions) {
      if (q.type !== section.questionType) {
        warnings.push(
          `Question ${q.id}: type "${q.type}" doesn't match section "${section.questionType}", fixed`,
        );
        q.type = section.questionType;
      }
    }
  }

  // Step 4: Ensure MCQs have exactly 4 options
  for (const section of paper.sections) {
    for (const q of section.questions) {
      if (q.type === 'mcq') {
        if (!q.options || q.options.length === 0) {
          q.options = ['Option A', 'Option B', 'Option C', 'Option D'];
          warnings.push(`Question ${q.id}: MCQ missing options, added defaults`);
        } else if (q.options.length < 4) {
          while (q.options.length < 4) {
            q.options.push(`Option ${String.fromCharCode(65 + q.options.length)}`);
          }
          warnings.push(`Question ${q.id}: MCQ had fewer than 4 options, padded`);
        }
      }
    }
  }

  // Step 5: Ensure all marks are positive integers
  for (const section of paper.sections) {
    for (const q of section.questions) {
      if (q.marks < 1) {
        q.marks = 1;
        warnings.push(`Question ${q.id}: marks was < 1, set to 1`);
      }
    }
  }

  // Step 6: Check total marks
  const actualMarks = paper.sections.reduce(
    (sum, s) => sum + s.questions.reduce((qs, q) => qs + q.marks, 0),
    0,
  );
  if (actualMarks !== expectedTotalMarks) {
    warnings.push(
      `Total marks mismatch: expected ${expectedTotalMarks}, got ${actualMarks}`,
    );
    // Update maxMarks to reflect actual content
    paper.maxMarks = actualMarks;
  }

  // Step 7: Ensure answer key covers all questions
  const allQuestionIds = paper.sections.flatMap((s) =>
    s.questions.map((q) => q.id),
  );
  const answerIds = new Set(paper.answerKey.map((a) => a.questionId));
  for (const qId of allQuestionIds) {
    if (!answerIds.has(qId)) {
      paper.answerKey.push({ questionId: qId, answer: 'Answer not generated' });
      warnings.push(`Answer key: added placeholder for question ${qId}`);
    }
  }

  // Step 8: Default instructions
  if (!paper.instructions || paper.instructions.length < 5) {
    paper.instructions =
      'All questions are compulsory unless stated otherwise. Read each question carefully before answering.';
    warnings.push('Default instructions added');
  }

  return { valid: true, paper, warnings, errors };
}
