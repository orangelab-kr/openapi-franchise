import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../../middlewares/internal/permissions';

import { InternalFranchiseUserMiddleware } from '../../../middlewares/internal';
import OPCODE from '../../../tools/opcode';
import { Router } from 'express';
import User from '../../../controllers/user';
import Wrapper from '../../../tools/wrapper';

export default function getInternalFranchisesUsersRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.USERS_LIST),
    Wrapper(async (req, res) => {
      const { internal, query } = req;
      const { franchiseUsers, total } = await User.getUsers(
        internal.franchise,
        query
      );

      res.json({ opcode: OPCODE.SUCCESS, franchiseUsers, total });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.USERS_CREATE),
    Wrapper(async (req, res) => {
      const { internal, body } = req;
      const { franchiseUserId } = await User.createUser(
        internal.franchise,
        body
      );
      res.json({ opcode: OPCODE.SUCCESS, franchiseUserId });
    })
  );

  router.get(
    '/:franchiseUserId',
    InternalPermissionMiddleware(PERMISSION.USERS_VIEW),
    InternalFranchiseUserMiddleware(),
    Wrapper(async (req, res) => {
      const { franchiseUser } = req.internal;
      res.json({ opcode: OPCODE.SUCCESS, franchiseUser });
    })
  );

  router.post(
    '/:franchiseUserId',
    InternalPermissionMiddleware(PERMISSION.USERS_MODIFY),
    InternalFranchiseUserMiddleware(),
    Wrapper(async (req, res) => {
      const { body, internal } = req;
      await User.modifyUser(internal.franchiseUser, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:franchiseUserId',
    InternalPermissionMiddleware(PERMISSION.USERS_DELETE),
    InternalFranchiseUserMiddleware(),
    Wrapper(async (req, res) => {
      const { franchise, franchiseUser } = req.internal;
      await User.deleteUser(franchise, franchiseUser);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
