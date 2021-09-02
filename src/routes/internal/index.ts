import { Router } from 'express';
import {
  getInternalAuthorizeRouter,
  getInternalFranchisesRouter,
  getInternalLogsRouter,
  getInternalPermissionGroupsRouter,
  getInternalPermissionsRouter,
} from '../..';

export * from './authorize';
export * from './franchises';
export * from './logs';
export * from './permissionGroups';
export * from './permissions';

export function getInternalRouter(): Router {
  const router = Router();

  router.use('/franchises', getInternalFranchisesRouter());
  router.use('/permissions', getInternalPermissionsRouter());
  router.use('/permissionGroups', getInternalPermissionGroupsRouter());
  router.use('/authorize', getInternalAuthorizeRouter());
  router.use('/logs', getInternalLogsRouter());

  return router;
}
