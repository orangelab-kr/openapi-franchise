import { Router } from 'express';
import {
  PlatformFranchiseMiddleware,
  PlatformMiddleware,
  RESULT,
  Wrapper,
} from '../..';

export function getPlatformFranchisesRouter(): Router {
  const router = Router();

  router.get(
    '/:franchiseId',
    PlatformMiddleware({ permissionIds: ['franchises.view'], final: true }),
    PlatformFranchiseMiddleware(),
    Wrapper(async (req) => {
      const { franchise } = req.platform;
      throw RESULT.SUCCESS({ details: { franchise } });
    })
  );

  return router;
}
