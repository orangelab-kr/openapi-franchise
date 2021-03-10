import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../../middlewares/internal/permissions';

import Franchise from '../../../controllers/franchise';
import InternalFranchiseMiddleware from '../../../middlewares/internal/franchise';
import OPCODE from '../../../tools/opcode';
import { Router } from 'express';
import Wrapper from '../../../tools/wrapper';
import getInternalFranchisesUsersRouter from './users';

export default function getInternalFranchisesRouter(): Router {
  const router = Router();

  router.use(
    '/:franchiseId/users',
    InternalFranchiseMiddleware(),
    getInternalFranchisesUsersRouter()
  );

  // router.use(
  //   '/:franchiseId/logs',
  //   InternalFranchiseMiddleware(),
  //   getInternalFranchisesLogsRouter()
  // );

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.FRANCHISES_LIST),
    Wrapper(async (req, res) => {
      const { franchises, total } = await Franchise.getFranchises(req.query);
      res.json({ opcode: OPCODE.SUCCESS, franchises, total });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.FRANCHISES_CREATE),
    Wrapper(async (req, res) => {
      const { franchiseId } = await Franchise.createFranchise(req.body);
      res.json({ opcode: OPCODE.SUCCESS, franchiseId });
    })
  );

  router.get(
    '/:franchiseId',
    InternalPermissionMiddleware(PERMISSION.FRANCHISES_VIEW),
    InternalFranchiseMiddleware(),
    Wrapper(async (req, res) => {
      const { franchise } = req.internal;
      res.json({ opcode: OPCODE.SUCCESS, franchise });
    })
  );

  router.post(
    '/:franchiseId',
    InternalPermissionMiddleware(PERMISSION.FRANCHISES_MODIFY),
    InternalFranchiseMiddleware(),
    Wrapper(async (req, res) => {
      const { body, internal } = req;
      await Franchise.modifyFranchise(internal.franchise, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:franchiseId',
    InternalPermissionMiddleware(PERMISSION.FRANCHISES_DELETE),
    InternalFranchiseMiddleware(),
    Wrapper(async (req, res) => {
      const { franchise } = req.internal;
      await Franchise.deleteFranchise(franchise);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
