import { Assignment } from '../models/assignment.model';
import { GeneratedPaper } from '../models/generated-paper.model';
import { assessmentQueue } from '../queues/assessment.queue';
import { buildState, setJobState, getJobStateByAssignment, updateAndPublish } from './job-state.service';
import { NotFoundError } from '../utils/errors';
import type { GenerationJobState } from '@vedaai/shared';

export interface StartGenerationResult {
  assignmentId: string;
  jobId: string;
  state: GenerationJobState;
}

export async function startGeneration(
  assignmentId: string,
  options: { force?: boolean } = {},
): Promise<StartGenerationResult> {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new NotFoundError('Assignment');

  // If already queued/processing, return existing state
  if (
    !options.force &&
    (assignment.status === 'queued' || assignment.status === 'processing') &&
    assignment.latestJobId
  ) {
    const existingState = await getJobStateByAssignment(assignmentId);
    if (existingState) {
      return { assignmentId, jobId: assignment.latestJobId, state: existingState };
    }
  }

  // If completed and not forcing, return existing state
  if (!options.force && assignment.status === 'completed' && assignment.latestJobId) {
    const existingState = await getJobStateByAssignment(assignmentId);
    if (existingState) {
      return { assignmentId, jobId: assignment.latestJobId, state: existingState };
    }
  }

  // Create new BullMQ job
  const job = await assessmentQueue.add('generate-assessment', {
    assignmentId,
    force: options.force,
  });

  const jobId = job.id ?? `job-${Date.now()}`;

  // Update assignment
  assignment.status = 'queued';
  assignment.latestJobId = jobId;
  assignment.generationStartedAt = new Date();
  assignment.generationCompletedAt = undefined;
  assignment.generationError = undefined;
  await assignment.save();

  // Create initial Redis state
  const state = buildState(assignmentId, jobId, {
    status: 'queued',
    progress: 0,
    message: 'Queued for generation',
    currentStep: 'queued',
  });
  await setJobState(state);

  // Publish queued event
  await updateAndPublish(assignmentId, jobId, {
    status: 'queued',
    progress: 0,
    message: 'Queued for generation',
    currentStep: 'queued',
  });

  return { assignmentId, jobId, state };
}

export async function regenerateAssignment(assignmentId: string): Promise<StartGenerationResult> {
  return startGeneration(assignmentId, { force: true });
}

export async function getGenerationState(assignmentId: string): Promise<GenerationJobState | null> {
  return getJobStateByAssignment(assignmentId);
}

export async function getGeneratedPaper(assignmentId: string): Promise<Record<string, unknown> | null> {
  const paper = await GeneratedPaper.findOne({ assignmentId }).sort({ createdAt: -1 });
  if (!paper) return null;
  return paper.toJSON();
}
