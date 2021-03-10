import { Router } from 'express';
import getInternalFranchisesRouter from './franchises';
import getInternalLogsRouter from './logs';
import getInternalPermissionGroupsRouter from './permissionGroups';
import getInternalPermissionsRouter from './permissions';

export default function getInternalRouter(): Router {
  const router = Router();

  router.use('/franchises', getInternalFranchisesRouter());
  router.use('/permissions', getInternalPermissionsRouter());
  router.use('/permissionGroups', getInternalPermissionGroupsRouter());
  router.use('/logs', getInternalLogsRouter());

  return router;
}
