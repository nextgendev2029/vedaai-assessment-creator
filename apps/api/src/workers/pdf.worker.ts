import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { GeneratedPaper } from '../models/generated-paper.model';
import { GeneratedPdf } from '../models/generated-pdf.model';
import { buildPaperPdf } from '../services/pdf/pdf-builder.service';
import type { PdfJobData } from '../services/pdf/pdf-state.service';

async function processPdfJob(job: Job<PdfJobData>): Promise<void> {
  const { assignmentId, generatedPaperId } = job.data;
  const jobId = job.id ?? 'unknown';

  console.log(`📄 Processing PDF job ${jobId} for assignment: ${assignmentId}`);

  // Find the GeneratedPdf document for this job
  const pdfDoc = await GeneratedPdf.findOne({
    assignmentId,
    jobId,
  });

  try {
    // Set status to processing
    if (pdfDoc) {
      pdfDoc.status = 'processing';
      await pdfDoc.save();
    }

    // Load generated paper
    const paper = await GeneratedPaper.findById(generatedPaperId);
    if (!paper) {
      throw new Error(`Generated paper ${generatedPaperId} not found`);
    }

    // Generate PDF buffer
    console.log(`📄 Building PDF for: ${paper.subject} - ${paper.topic}`);
    const pdfBuffer = await buildPaperPdf(paper);
    console.log(`📄 PDF generated: ${pdfBuffer.length} bytes`);

    // Save to MongoDB
    if (pdfDoc) {
      pdfDoc.status = 'ready';
      pdfDoc.data = pdfBuffer;
      pdfDoc.size = pdfBuffer.length;
      pdfDoc.generatedAt = new Date();
      pdfDoc.error = undefined;
      await pdfDoc.save();
    } else {
      // Fallback: create if somehow missing
      const fileName = `${paper.subject}_${paper.className}_${paper.topic}.pdf`
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_.-]/g, '');

      await GeneratedPdf.create({
        assignmentId,
        generatedPaperId,
        jobId,
        status: 'ready',
        fileName,
        contentType: 'application/pdf',
        data: pdfBuffer,
        size: pdfBuffer.length,
        generatedAt: new Date(),
      });
    }

    console.log(`✅ PDF job ${jobId} completed`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`❌ PDF job ${jobId} failed:`, errorMessage);

    // Update status to failed
    if (pdfDoc) {
      pdfDoc.status = 'failed';
      pdfDoc.error = errorMessage;
      await pdfDoc.save();
    }

    throw err;
  }
}

export function createPdfWorker(): Worker<PdfJobData> {
  const worker = new Worker<PdfJobData>(
    'pdf-generation',
    processPdfJob,
    {
      connection: redis,
      concurrency: 2,
    },
  );

  worker.on('completed', (job: Job<PdfJobData>) => {
    console.log(`✅ PDF Worker: Job ${job.id} completed`);
  });

  worker.on('failed', (job: Job<PdfJobData> | undefined, err: Error) => {
    console.error(`❌ PDF Worker: Job ${job?.id ?? 'unknown'} failed:`, err.message);
  });

  worker.on('error', (err: Error) => {
    console.error('❌ PDF Worker error:', err.message);
  });

  console.log('✅ PDF worker created');
  return worker;
}
