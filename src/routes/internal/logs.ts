import { Router } from 'express';
import {
  InternalPermissionMiddleware,
  Log,
  RESULT,
  PERMISSION,
  Wrapper,
} from '../..';

export function getInternalLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.LOGS_LIST),
    Wrapper(async (req) => {
      const { query } = req;
      const { total, franchiseLogs } = await Log.getLogs(query);
      throw RESULT.SUCCESS({ details: { franchiseLogs, total } });
    })
  );

  router.get(
    '/:franchiseLogId',
    InternalPermissionMiddleware(PERMISSION.LOGS_VIEW),
    Wrapper(async (req) => {
      const {
        params: { franchiseLogId },
      } = req;

      const franchiseLog = await Log.getLogOrThrow(franchiseLogId);
      throw RESULT.SUCCESS({ details: { franchiseLog } });
    })
  );

  return router;
}
