import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

import { Log } from '../../controllers';
import { Router } from 'express';

export default function getInternalLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.LOGS_LIST),
    Wrapper(async (req, res) => {
      const { query } = req;
      const { total, franchiseLogs } = await Log.getLogs(query);
      res.json({ opcode: OPCODE.SUCCESS, franchiseLogs, total });
    })
  );

  router.get(
    '/:franchiseLogId',
    InternalPermissionMiddleware(PERMISSION.LOGS_VIEW),
    Wrapper(async (req, res) => {
      const {
        params: { franchiseLogId },
      } = req;

      const franchiseLog = await Log.getLogOrThrow(franchiseLogId);
      res.json({ opcode: OPCODE.SUCCESS, franchiseLog });
    })
  );

  return router;
}
