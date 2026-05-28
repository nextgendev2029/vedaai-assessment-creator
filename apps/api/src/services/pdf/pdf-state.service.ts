import { Queue } from 'bullmq';
import { redis } from '../../config/redis';

export interface PdfJobData {
  assignmentId: string;
  generatedPaperId: string;
  force?: boolean;
}

export const pdfQueue = new Queue<PdfJobData>('pdf-generation', {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 25 },
  },
});

console.log('✅ PDF queue ready');
