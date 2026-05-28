import { redis, redisPub, GENERATION_PROGRESS_CHANNEL } from '../config/redis';
import type { GenerationJobState, GenerationStep } from '@vedaai/shared';

const ASSIGNMENT_KEY_PREFIX = 'generation:assignment:';
const JOB_KEY_PREFIX = 'generation:job:';
const STATE_TTL = 86400; // 24 hours

export function buildState(
  assignmentId: string,
  jobId: string,
  overrides: Partial<GenerationJobState>,
): GenerationJobState {
  return {
    assignmentId,
    jobId,
    status: 'queued',
    progress: 0,
    message: 'Queued for generation',
    currentStep: 'queued',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export async function setJobState(state: GenerationJobState): Promise<void> {
  const json = JSON.stringify(state);
  const pipeline = redis.pipeline();
  pipeline.set(`${ASSIGNMENT_KEY_PREFIX}${state.assignmentId}`, json, 'EX', STATE_TTL);
  pipeline.set(`${JOB_KEY_PREFIX}${state.jobId}`, json, 'EX', STATE_TTL);
  await pipeline.exec();
}

export async function getJobStateByAssignment(assignmentId: string): Promise<GenerationJobState | null> {
  const json = await redis.get(`${ASSIGNMENT_KEY_PREFIX}${assignmentId}`);
  return json ? (JSON.parse(json) as GenerationJobState) : null;
}

export async function getJobStateByJobId(jobId: string): Promise<GenerationJobState | null> {
  const json = await redis.get(`${JOB_KEY_PREFIX}${jobId}`);
  return json ? (JSON.parse(json) as GenerationJobState) : null;
}

export async function updateAndPublish(
  assignmentId: string,
  jobId: string,
  updates: {
    status?: 'queued' | 'processing' | 'completed' | 'failed';
    progress?: number;
    message?: string;
    currentStep?: GenerationStep;
    resultId?: string;
    error?: string;
  },
): Promise<GenerationJobState> {
  const existing = await getJobStateByAssignment(assignmentId);
  const state: GenerationJobState = {
    assignmentId,
    jobId,
    status: updates.status ?? existing?.status ?? 'processing',
    progress: updates.progress ?? existing?.progress ?? 0,
    message: updates.message ?? existing?.message ?? '',
    currentStep: updates.currentStep ?? existing?.currentStep ?? 'queued',
    resultId: updates.resultId ?? existing?.resultId,
    error: updates.error ?? existing?.error,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setJobState(state);
  await redisPub.publish(GENERATION_PROGRESS_CHANNEL, JSON.stringify(state));
  return state;
}
