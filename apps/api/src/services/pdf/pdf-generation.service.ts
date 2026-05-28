import { GeneratedPaper } from '../../models/generated-paper.model';
import { GeneratedPdf } from '../../models/generated-pdf.model';
import { pdfQueue, type PdfJobData } from './pdf-state.service';

interface PdfGenerationResult {
  assignmentId: string;
  pdfId: string;
  jobId: string;
  status: string;
  downloadUrl: string;
}

/**
 * Start PDF generation for an assignment.
 * If a ready PDF exists and force is false, return existing.
 */
export async function startPdfGeneration(
  assignmentId: string,
  force = false,
): Promise<PdfGenerationResult> {
  // Find latest generated paper
  const paper = await GeneratedPaper.findOne({ assignmentId })
    .sort({ createdAt: -1 })
    .lean();

  if (!paper) {
    throw new Error('Generated paper is not ready yet');
  }

  const generatedPaperId = String(paper._id);

  // Check if PDF already exists and is ready
  if (!force) {
    const existing = await GeneratedPdf.findOne({
      assignmentId,
      generatedPaperId: paper._id,
      status: 'ready',
    }).sort({ createdAt: -1 });

    if (existing) {
      return {
        assignmentId,
        pdfId: String(existing._id),
        jobId: existing.jobId || '',
        status: 'ready',
        downloadUrl: `/api/assignments/${assignmentId}/pdf/download`,
      };
    }
  }

  // Check for in-progress PDF
  const inProgress = await GeneratedPdf.findOne({
    assignmentId,
    generatedPaperId: paper._id,
    status: { $in: ['queued', 'processing'] },
  });

  if (inProgress && !force) {
    return {
      assignmentId,
      pdfId: String(inProgress._id),
      jobId: inProgress.jobId || '',
      status: inProgress.status,
      downloadUrl: `/api/assignments/${assignmentId}/pdf/download`,
    };
  }

  // Create PDF document with queued status
  const fileName = `${paper.subject}_${paper.className}_${paper.topic}.pdf`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_.-]/g, '');

  const pdfDoc = await GeneratedPdf.create({
    assignmentId,
    generatedPaperId: paper._id,
    status: 'queued',
    fileName,
    contentType: 'application/pdf',
  });

  // Add job to queue
  const jobData: PdfJobData = {
    assignmentId,
    generatedPaperId,
    force,
  };

  const job = await pdfQueue.add('generate-pdf', jobData, {
    jobId: `pdf-${assignmentId}-${Date.now()}`,
  });

  const jobId = job.id || '';

  // Update pdfDoc with jobId
  pdfDoc.jobId = jobId;
  await pdfDoc.save();

  return {
    assignmentId,
    pdfId: String(pdfDoc._id),
    jobId,
    status: 'queued',
    downloadUrl: `/api/assignments/${assignmentId}/pdf/download`,
  };
}

/**
 * Get latest PDF state for an assignment.
 */
export async function getPdfState(assignmentId: string) {
  const pdf = await GeneratedPdf.findOne({ assignmentId })
    .sort({ createdAt: -1 });

  if (!pdf) {
    return null;
  }

  return {
    pdfId: String(pdf._id),
    status: pdf.status,
    fileName: pdf.fileName,
    size: pdf.size,
    error: pdf.error,
    downloadUrl: pdf.status === 'ready' ? `/api/assignments/${assignmentId}/pdf/download` : undefined,
    generatedAt: pdf.generatedAt?.toISOString(),
    createdAt: pdf.createdAt.toISOString(),
  };
}
