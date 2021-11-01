import { Router } from 'express';
import {
  Franchise,
  getInternalFranchisesLogsRouter,
  getInternalFranchisesUsersRouter,
  InternalFranchiseMiddleware,
  InternalPermissionMiddleware,
  PERMISSION,
  RESULT,
  Wrapper,
} from '../../..';

export * from './logs';
export * from './users';

export function getInternalFranchisesRouter(): Router {
  const router = Router();

  router.use(
    '/:franchiseId/users',
    InternalFranchiseMiddleware(),
    getInternalFranchisesUsersRouter()
  );

  router.use(
    '/:franchiseId/logs',
    InternalFranchiseMiddleware(),
    getInternalFranchisesLogsRouter()
  );

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.FRANCHISES_LIST),
    Wrapper(async (req) => {
      const { franchises, total } = await Franchise.getFranchises(req.query);
      throw RESULT.SUCCESS({ details: { franchises, total } });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.FRANCHISES_CREATE),
    Wrapper(async (req) => {
      const { franchiseId } = await Franchise.createFranchise(req.body);
      throw RESULT.SUCCESS({ details: { franchiseId } });
    })
  );

  router.get(
    '/:franchiseId',
    InternalPermissionMiddleware(PERMISSION.FRANCHISES_VIEW),
    InternalFranchiseMiddleware(),
    Wrapper(async (req) => {
      const { franchise } = req.internal;
      throw RESULT.SUCCESS({ details: { franchise } });
    })
  );

  router.post(
    '/:franchiseId',
    InternalPermissionMiddleware(PERMISSION.FRANCHISES_MODIFY),
    InternalFranchiseMiddleware(),
    Wrapper(async (req) => {
      const { body, internal } = req;
      await Franchise.modifyFranchise(internal.franchise, body);
      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/:franchiseId',
    InternalPermissionMiddleware(PERMISSION.FRANCHISES_DELETE),
    InternalFranchiseMiddleware(),
    Wrapper(async (req) => {
      const { franchise } = req.internal;
      await Franchise.deleteFranchise(franchise);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
