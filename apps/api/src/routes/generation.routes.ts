import { Router, type Request, type Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { success } from '../utils/api-response';
import * as generationService from '../services/generation.service';

const router: Router = Router();

/** POST /api/assignments/:id/generate */
router.post(
  '/:id/generate',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await generationService.startGeneration(req.params.id as string);
    res.json(success(result));
  }),
);

/** POST /api/assignments/:id/regenerate */
router.post(
  '/:id/regenerate',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await generationService.regenerateAssignment(req.params.id as string);
    res.json(success(result));
  }),
);

/** GET /api/assignments/:id/generation-state */
router.get(
  '/:id/generation-state',
  asyncHandler(async (req: Request, res: Response) => {
    const state = await generationService.getGenerationState(req.params.id as string);
    if (!state) {
      res.json(success(null, 'No generation state found'));
      return;
    }
    res.json(success(state));
  }),
);

/** GET /api/assignments/:id/result — returns latest generated paper */
router.get(
  '/:id/result',
  asyncHandler(async (req: Request, res: Response) => {
    const paper = await generationService.getGeneratedPaper(req.params.id as string);
    if (!paper) {
      res.json(success(null, 'Generated result is not available yet'));
      return;
    }
    res.json(success(paper));
  }),
);

export default router;
