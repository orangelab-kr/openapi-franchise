import { Router } from 'express';
import {
  InternalPermissionMiddleware,
  Log,
  OPCODE,
  PERMISSION,
  Wrapper,
} from '../../..';

export function getInternalFranchisesLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.LOGS_LIST),
    Wrapper(async (req, res) => {
      const {
        query,
        internal: { franchise },
      } = req;

      const { total, franchiseLogs } = await Log.getLogs(query, franchise);
      res.json({ opcode: OPCODE.SUCCESS, franchiseLogs, total });
    })
  );

  router.get(
    '/:franchiseLogId',
    InternalPermissionMiddleware(PERMISSION.LOGS_VIEW),
    Wrapper(async (req, res) => {
      const {
        internal: { franchise },
        params: { franchiseLogId },
      } = req;

      const franchiseLog = await Log.getLogOrThrow(franchiseLogId, franchise);
      res.json({ opcode: OPCODE.SUCCESS, franchiseLog });
    })
  );

  return router;
}
