import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { asyncHandler } from '../utils/async-handler';
import { success, error } from '../utils/api-response';
import { ValidationError } from '../utils/errors';
import { extractTextFromFile } from '../utils/file-extract';
import {
  CreateAssignmentSchema,
  UpdateAssignmentSchema,
  ListAssignmentsQuerySchema,
} from '../validators/assignment.validator';
import * as assignmentService from '../services/assignment.service';

/* ─── Multer config ──────────────────────────────────────────────────────── */

const ACCEPTED_MIMES = [
  'application/pdf',
  'text/plain',
  'image/png',
  'image/jpeg',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ACCEPTED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

/* ─── Router ─────────────────────────────────────────────────────────────── */

const router: Router = Router();

/* ── GET /api/assignments ────────────────────────────────────────────────── */

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = ListAssignmentsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.');
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }
      res.status(400).json(error('Invalid query parameters', fieldErrors));
      return;
    }

    const result = await assignmentService.listAssignments(parsed.data);
    res.json(success(result));
  }),
);

/* ── POST /api/assignments ───────────────────────────────────────────────── */

router.post(
  '/',
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    // Parse body — either JSON or multipart `data` field
    let body: unknown;
    if (req.is('multipart/form-data') && typeof req.body?.data === 'string') {
      try {
        body = JSON.parse(req.body.data);
      } catch {
        res.status(400).json(error('Invalid JSON in "data" field'));
        return;
      }
    } else {
      body = req.body;
    }

    // Validate
    const parsed = CreateAssignmentSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.');
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }
      throw new ValidationError('Validation failed', fieldErrors);
    }

    // Process file if present
    let fileMeta: { fileName: string; mimeType: string; size: number; extractedText: string } | undefined;
    if (req.file) {
      const extractedText = await extractTextFromFile(req.file.buffer, req.file.mimetype);
      fileMeta = {
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        extractedText,
      };
    }

    const assignment = await assignmentService.createAssignment(parsed.data, fileMeta);
    res.status(201).json(success(assignment));
  }),
);

/* ── GET /api/assignments/:id ────────────────────────────────────────────── */

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const assignment = await assignmentService.getAssignmentById(req.params.id as string);
    res.json(success(assignment));
  }),
);

/* ── PATCH /api/assignments/:id ──────────────────────────────────────────── */

router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = UpdateAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.');
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }
      throw new ValidationError('Validation failed', fieldErrors);
    }

    const assignment = await assignmentService.updateAssignment(req.params.id as string, parsed.data);
    res.json(success(assignment));
  }),
);

/* ── DELETE /api/assignments/:id ─────────────────────────────────────────── */

router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await assignmentService.deleteAssignment(req.params.id as string);
    res.json(success({ id: req.params.id as string }));
  }),
);


export default router;
