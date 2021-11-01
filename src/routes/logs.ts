import { Router } from 'express';
import { Log, RESULT, Wrapper } from '..';

export function getLogsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { query, loggined } = req;
      const { total, franchiseLogs } = await Log.getLogs(
        query,
        loggined.franchise
      );

      throw RESULT.SUCCESS({ details: { franchiseLogs, total } });
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
      throw RESULT.SUCCESS({ details: { franchiseLog } });
    })
  );

  return router;
}
