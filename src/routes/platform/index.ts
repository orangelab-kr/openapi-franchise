import { Router } from 'express';
import { getPlatformFranchisesRouter } from '../..';

export * from './franchises';

export function getPlatformRouter(): Router {
  const router = Router();

  router.use('/franchises', getPlatformFranchisesRouter());

  return router;
}
