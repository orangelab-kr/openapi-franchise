import { Log } from '../controllers';
import OPCODE from '../tools/opcode';
import { Router } from 'express';
import Wrapper from '../tools/wrapper';

export default function getLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { query, loggined } = req;
      const { total, franchiseLogs } = await Log.getLogs(
        query,
        loggined.franchise
      );

      res.json({ opcode: OPCODE.SUCCESS, franchiseLogs, total });
    })
  );

  router.get(
    '/:franchiseLogId',
    Wrapper(async (req, res) => {
      const {
        loggined: { franchise },
        params: { franchiseLogId },
      } = req;

      const franchiseLog = await Log.getLogOrThrow(franchiseLogId, franchise);
      res.json({ opcode: OPCODE.SUCCESS, franchiseLog });
    })
  );

  return router;
}
