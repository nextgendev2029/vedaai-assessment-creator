import { Assignment, type IAssignment } from '../models/assignment.model';
import { NotFoundError } from '../utils/errors';
import type { CreateAssignmentInput, UpdateAssignmentInput, ListAssignmentsQuery } from '../validators/assignment.validator';
import type { FilterQuery } from 'mongoose';

/* ─── Response type (clean JSON) ─────────────────────────────────────────── */

export interface AssignmentResponse {
  id: string;
  title: string;
  subject: string;
  className: string;
  topic: string;
  dueDate: string;
  durationMinutes?: number;
  instructions?: string;
  questionConfigs: { type: string; count: number; marks: number }[];
  totalQuestions: number;
  totalMarks: number;
  status: string;
  sourceMaterial?: {
    fileName?: string;
    mimeType?: string;
    size?: number;
  };
  createdAt: string;
  updatedAt: string;
}

/** Map Mongoose document to clean API response */
function toResponse(doc: IAssignment): AssignmentResponse {
  const obj = doc.toJSON();
  return {
    id: obj.id,
    title: obj.title,
    subject: obj.subject,
    className: obj.className,
    topic: obj.topic,
    dueDate: obj.dueDate instanceof Date ? obj.dueDate.toISOString() : String(obj.dueDate),
    durationMinutes: obj.durationMinutes,
    instructions: obj.instructions,
    questionConfigs: obj.questionConfigs.map((q: { type: string; count: number; marks: number }) => ({
      type: q.type,
      count: q.count,
      marks: q.marks,
    })),
    totalQuestions: obj.totalQuestions,
    totalMarks: obj.totalMarks,
    status: obj.status,
    sourceMaterial: obj.sourceMaterial
      ? {
          fileName: obj.sourceMaterial.fileName,
          mimeType: obj.sourceMaterial.mimeType,
          size: obj.sourceMaterial.size,
        }
      : undefined,
    createdAt: obj.createdAt instanceof Date ? obj.createdAt.toISOString() : String(obj.createdAt),
    updatedAt: obj.updatedAt instanceof Date ? obj.updatedAt.toISOString() : String(obj.updatedAt),
  };
}

/* ─── Parse due date ─────────────────────────────────────────────────────── */

function parseDueDate(dateStr: string): Date {
  // Accept DD-MM-YYYY or YYYY-MM-DD
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('-');
    return new Date(`${y}-${m}-${d}T23:59:59.000Z`);
  }
  return new Date(dateStr);
}

/* ─── Service methods ────────────────────────────────────────────────────── */

export async function createAssignment(
  input: CreateAssignmentInput,
  fileMeta?: { fileName: string; mimeType: string; size: number; extractedText: string },
): Promise<AssignmentResponse> {
  const totalQuestions = input.questionConfigs.reduce((s, q) => s + q.count, 0);
  const totalMarks = input.questionConfigs.reduce((s, q) => s + q.count * q.marks, 0);

  const doc = await Assignment.create({
    title: input.title,
    subject: input.subject,
    className: input.className,
    topic: input.topic,
    dueDate: parseDueDate(input.dueDate),
    durationMinutes: input.durationMinutes,
    instructions: input.instructions,
    questionConfigs: input.questionConfigs,
    totalQuestions,
    totalMarks,
    status: 'draft',
    sourceMaterial: fileMeta
      ? {
          fileName: fileMeta.fileName,
          mimeType: fileMeta.mimeType,
          size: fileMeta.size,
          extractedText: fileMeta.extractedText,
        }
      : undefined,
  });

  return toResponse(doc);
}

export async function listAssignments(query: ListAssignmentsQuery): Promise<{
  items: AssignmentResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}> {
  const filter: FilterQuery<IAssignment> = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { subject: { $regex: query.search, $options: 'i' } },
      { topic: { $regex: query.search, $options: 'i' } },
    ];
  }

  const skip = (query.page - 1) * query.limit;

  const [docs, total] = await Promise.all([
    Assignment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    Assignment.countDocuments(filter),
  ]);

  return {
    items: docs.map(toResponse),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function getAssignmentById(id: string): Promise<AssignmentResponse> {
  const doc = await Assignment.findById(id);
  if (!doc) throw new NotFoundError('Assignment');
  return toResponse(doc);
}

export async function updateAssignment(
  id: string,
  input: UpdateAssignmentInput,
): Promise<AssignmentResponse> {
  const doc = await Assignment.findById(id);
  if (!doc) throw new NotFoundError('Assignment');

  if (input.title !== undefined) doc.title = input.title;
  if (input.subject !== undefined) doc.subject = input.subject;
  if (input.className !== undefined) doc.className = input.className;
  if (input.topic !== undefined) doc.topic = input.topic;
  if (input.dueDate !== undefined) doc.dueDate = parseDueDate(input.dueDate);
  if (input.durationMinutes !== undefined) doc.durationMinutes = input.durationMinutes;
  if (input.instructions !== undefined) doc.instructions = input.instructions;
  if (input.questionConfigs !== undefined) {
    doc.questionConfigs = input.questionConfigs;
    doc.totalQuestions = input.questionConfigs.reduce((s, q) => s + q.count, 0);
    doc.totalMarks = input.questionConfigs.reduce((s, q) => s + q.count * q.marks, 0);
  }

  await doc.save();
  return toResponse(doc);
}

export async function deleteAssignment(id: string): Promise<void> {
  const doc = await Assignment.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError('Assignment');
}
