import { Router } from 'express';
import {
  InternalPermissionMiddleware,
  Log,
  PERMISSION,
  RESULT,
  Wrapper,
} from '../../..';

export function getInternalFranchisesLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.LOGS_LIST),
    Wrapper(async (req) => {
      const {
        query,
        internal: { franchise },
      } = req;

      const { total, franchiseLogs } = await Log.getLogs(query, franchise);
      throw RESULT.SUCCESS({ details: { franchiseLogs, total } });
    })
  );

  router.get(
    '/:franchiseLogId',
    InternalPermissionMiddleware(PERMISSION.LOGS_VIEW),
    Wrapper(async (req) => {
      const {
        internal: { franchise },
        params: { franchiseLogId },
      } = req;

      const franchiseLog = await Log.getLogOrThrow(franchiseLogId, franchise);
      throw RESULT.SUCCESS({ details: { franchiseLog } });
    })
  );

  return router;
}
