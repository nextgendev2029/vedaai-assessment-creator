import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { Assignment } from '../models/assignment.model';
import { GeneratedPaper } from '../models/generated-paper.model';
import { updateAndPublish } from '../services/job-state.service';
import { generateAssessmentPaper } from '../services/ai/ai-generation.service';
import type { AssessmentJobData } from '../queues/assessment.queue';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processAssessmentJob(job: Job<AssessmentJobData>): Promise<void> {
  const { assignmentId, force } = job.data;
  const jobId = job.id ?? 'unknown';

  console.log(`🚀 Processing job ${jobId} for assignment: ${assignmentId}`);

  try {
    // Step 1: Validate assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    // Step 2: Set status processing
    assignment.status = 'processing';
    await assignment.save();

    // Step 3: Preparing context (10%)
    await updateAndPublish(assignmentId, jobId, {
      status: 'processing',
      progress: 10,
      message: 'Preparing assessment context...',
      currentStep: 'reading_material',
    });
    await job.updateProgress(10);
    await delay(400);

    // Step 4: Building prompt (25%)
    await updateAndPublish(assignmentId, jobId, {
      status: 'processing',
      progress: 25,
      message: 'Building generation prompt...',
      currentStep: 'building_prompt',
    });
    await job.updateProgress(25);
    await delay(300);

    // Step 5: Generating paper (40%)
    await updateAndPublish(assignmentId, jobId, {
      status: 'processing',
      progress: 40,
      message: 'Generating structured question paper...',
      currentStep: 'generating_questions',
    });
    await job.updateProgress(40);

    // Call AI generation service
    const result = await generateAssessmentPaper(assignment, { force });

    // Step 6: Validating output (75%)
    await updateAndPublish(assignmentId, jobId, {
      status: 'processing',
      progress: 75,
      message: 'Validating AI output...',
      currentStep: 'validating_output',
    });
    await job.updateProgress(75);
    await delay(200);

    // Step 7: Saving result (90%)
    await updateAndPublish(assignmentId, jobId, {
      status: 'processing',
      progress: 90,
      message: 'Saving generated paper...',
      currentStep: 'saving_result',
    });
    await job.updateProgress(90);

    // Determine generatedBy value for the DB
    const generatedByValue = result.metadata.provider;

    // Save to MongoDB
    const paper = await GeneratedPaper.create({
      assignmentId: assignment._id,
      jobId,
      ...result.paper,
      generatedBy: generatedByValue,
      aiMetadata: result.metadata,
    });

    // Step 8: Complete (100%)
    assignment.status = 'completed';
    assignment.generationCompletedAt = new Date();
    assignment.generationError = undefined;
    await assignment.save();

    const completionMessage = result.metadata.fallbackUsed
      ? `AI provider unavailable; generated with ${result.metadata.provider} fallback.`
      : 'Question paper generated successfully!';

    await updateAndPublish(assignmentId, jobId, {
      status: 'completed',
      progress: 100,
      message: completionMessage,
      currentStep: 'completed',
      resultId: String(paper._id),
    });
    await job.updateProgress(100);

    console.log(`✅ Job ${jobId} completed (${generatedByValue}). Paper ID: ${paper._id}`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`❌ Job ${jobId} failed:`, errorMessage);

    // Update assignment status
    try {
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'failed',
        generationError: errorMessage,
      });
    } catch (updateErr) {
      console.error('❌ Failed to update assignment status:', updateErr);
    }

    // Publish failed state
    await updateAndPublish(assignmentId, jobId, {
      status: 'failed',
      progress: 0,
      message: `Generation failed: ${errorMessage}`,
      currentStep: 'failed',
      error: errorMessage,
    });

    throw err;
  }
}

export function createAssessmentWorker(): Worker<AssessmentJobData> {
  const worker = new Worker<AssessmentJobData>(
    'assessment-generation',
    processAssessmentJob,
    {
      connection: redis,
      concurrency: 2,
    },
  );

  worker.on('completed', (job: Job<AssessmentJobData>) => {
    console.log(`✅ Worker: Job ${job.id} completed`);
  });

  worker.on('failed', (job: Job<AssessmentJobData> | undefined, err: Error) => {
    console.error(`❌ Worker: Job ${job?.id ?? 'unknown'} failed:`, err.message);
  });

  worker.on('error', (err: Error) => {
    console.error('❌ Worker error:', err.message);
  });

  console.log('✅ Assessment worker created');
  return worker;
}
