import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export interface AssessmentJobData {
  assignmentId: string;
  force?: boolean;
}

export const assessmentQueue = new Queue<AssessmentJobData>('assessment-generation', {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

console.log('✅ Assessment queue ready');
