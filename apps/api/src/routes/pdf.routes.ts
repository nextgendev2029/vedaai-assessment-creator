import { Router, type Request, type Response, type Router as RouterType } from 'express';
import { GeneratedPdf } from '../models/generated-pdf.model';
import { startPdfGeneration, getPdfState } from '../services/pdf/pdf-generation.service';

export const pdfRouter: RouterType = Router();

/* ─── POST /api/assignments/:id/pdf — Start PDF generation ───────────────── */
pdfRouter.post('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const force = req.body?.force === true;

    const result = await startPdfGeneration(id, force);

    res.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to start PDF generation';
    const status = message.includes('not ready') ? 400 : 500;
    res.status(status).json({ success: false, message });
  }
});

/* ─── GET /api/assignments/:id/pdf/state — PDF generation state ──────────── */
pdfRouter.get('/:id/pdf/state', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const state = await getPdfState(id);

    if (!state) {
      res.json({ success: true, data: null });
      return;
    }

    res.json({ success: true, data: state });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get PDF state';
    res.status(500).json({ success: false, message });
  }
});

/* ─── GET /api/assignments/:id/pdf/download — Download PDF ───────────────── */
pdfRouter.get('/:id/pdf/download', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const pdf = await GeneratedPdf.findOne({
      assignmentId: id,
      status: 'ready',
    }).sort({ createdAt: -1 });

    if (!pdf || !pdf.data) {
      res.status(404).json({
        success: false,
        message: 'PDF is not ready yet. Please generate it first.',
      });
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdf.fileName}"`);
    res.setHeader('Content-Length', pdf.data.length);
    res.send(pdf.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to download PDF';
    res.status(500).json({ success: false, message });
  }
});
