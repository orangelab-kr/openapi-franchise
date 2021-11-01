import { Router } from 'express';
import {
  clusterInfo,
  FranchiseMiddleware,
  getAuthRouter,
  getInternalRouter,
  getLogsRouter,
  getPermissionGroupsRouter,
  getPermissionRouter,
  getUserRouter,
  InternalMiddleware,
  RESULT,
  Wrapper,
} from '..';

export * from './auth';
export * from './internal';
export * from './logs';
export * from './permissionGroups';
export * from './permissions';
export * from './users';

export function getRouter(): Router {
  const router = Router();

  router.use('/internal', InternalMiddleware(), getInternalRouter());
  router.use('/logs', FranchiseMiddleware(), getLogsRouter());
  router.use('/users', FranchiseMiddleware(), getUserRouter());
  router.use('/auth', getAuthRouter());
  router.use('/permissions', FranchiseMiddleware(), getPermissionRouter());
  router.use(
    '/permissionGroups',
    FranchiseMiddleware(),
    getPermissionGroupsRouter()
  );

  router.get(
    '/',
    Wrapper(async () => {
      throw RESULT.SUCCESS({ details: clusterInfo });
    })
  );

  return router;
}
