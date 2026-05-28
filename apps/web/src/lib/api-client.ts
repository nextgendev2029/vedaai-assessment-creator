/**
 * Frontend API client for the VedaAI backend.
 * All methods return typed responses and throw on network errors.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface ApiAssignment {
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
  latestJobId?: string;
  sourceMaterial?: {
    fileName?: string;
    mimeType?: string;
    size?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]> | string[];
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]> | string[];

  constructor(message: string, statusCode: number, errors?: Record<string, string[]> | string[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
    },
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new ApiClientError(
      json.message || 'API request failed',
      res.status,
      json.errors,
    );
  }

  return json.data;
}

/* ─── Assignment API ─────────────────────────────────────────────────────── */

export async function fetchAssignments(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<ApiAssignment>> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  return request<PaginatedResponse<ApiAssignment>>(`/api/assignments${qs ? `?${qs}` : ''}`);
}

export async function fetchAssignmentById(id: string): Promise<ApiAssignment> {
  return request<ApiAssignment>(`/api/assignments/${id}`);
}

export interface CreateAssignmentData {
  title: string;
  subject: string;
  className: string;
  topic: string;
  dueDate: string;
  durationMinutes?: number;
  instructions?: string;
  questionConfigs: { type: string; count: number; marks: number }[];
}

export async function createAssignment(
  data: CreateAssignmentData,
  file?: File | null,
): Promise<ApiAssignment> {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (file) {
    formData.append('file', file);
  }

  return request<ApiAssignment>('/api/assignments', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type - browser sets multipart boundary automatically
  });
}

export async function deleteAssignment(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/api/assignments/${id}`, {
    method: 'DELETE',
  });
}

export async function updateAssignment(
  id: string,
  data: Partial<CreateAssignmentData>,
): Promise<ApiAssignment> {
  return request<ApiAssignment>(`/api/assignments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/* ─── Generation types ───────────────────────────────────────────────────── */

export interface GenerationJobState {
  assignmentId: string;
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  currentStep: string;
  resultId?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedPaperResponse {
  id: string;
  assignmentId: string;
  jobId?: string;
  schoolName: string;
  subject: string;
  className: string;
  topic: string;
  durationMinutes: number;
  maxMarks: number;
  instructions: string;
  sections: {
    title: string;
    questionType: string;
    instruction: string;
    questions: {
      id: string;
      text: string;
      type: string;
      difficulty: string;
      marks: number;
      options?: string[];
    }[];
  }[];
  answerKey: {
    questionId: string;
    answer: string;
  }[];
  generatedBy: string;
  aiMetadata?: {
    provider: string;
    model?: string;
    promptHash?: string;
    fallbackUsed: boolean;
    validationWarnings: string[];
    generatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StartGenerationResponse {
  assignmentId: string;
  jobId: string;
  state: GenerationJobState;
}

/* ─── Generation API ─────────────────────────────────────────────────────── */

export async function generateAssignment(id: string): Promise<StartGenerationResponse> {
  return request<StartGenerationResponse>(`/api/assignments/${id}/generate`, {
    method: 'POST',
  });
}

export async function regenerateAssignment(id: string): Promise<StartGenerationResponse> {
  return request<StartGenerationResponse>(`/api/assignments/${id}/regenerate`, {
    method: 'POST',
  });
}

export async function getGenerationState(id: string): Promise<GenerationJobState | null> {
  return request<GenerationJobState | null>(`/api/assignments/${id}/generation-state`);
}

export async function getGeneratedPaper(id: string): Promise<GeneratedPaperResponse | null> {
  return request<GeneratedPaperResponse | null>(`/api/assignments/${id}/result`);
}

/* ─── PDF API ────────────────────────────────────────────────────────────── */

export interface PdfGenerationResponse {
  assignmentId: string;
  pdfId: string;
  jobId: string;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  downloadUrl: string;
}

export interface PdfStateResponse {
  pdfId: string;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  fileName: string;
  size?: number;
  error?: string;
  downloadUrl?: string;
  generatedAt?: string;
  createdAt: string;
}

export async function startPdfGeneration(
  id: string,
  force = false,
): Promise<PdfGenerationResponse> {
  return request<PdfGenerationResponse>(`/api/assignments/${id}/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ force }),
  });
}

export async function getPdfState(id: string): Promise<PdfStateResponse | null> {
  return request<PdfStateResponse | null>(`/api/assignments/${id}/pdf/state`);
}

export function getPdfDownloadUrl(id: string): string {
  return `${API_BASE}/api/assignments/${id}/pdf/download`;
}
