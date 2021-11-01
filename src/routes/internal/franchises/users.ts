import { Router } from 'express';
import {
  InternalFranchiseUserMiddleware,
  InternalPermissionMiddleware,
  PERMISSION,
  RESULT,
  User,
  Wrapper,
} from '../../..';

export function getInternalFranchisesUsersRouter(): Router {
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

      throw RESULT.SUCCESS({ details: { franchiseUsers, total } });
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
      throw RESULT.SUCCESS({ details: { franchiseUserId } });
    })
  );

  router.get(
    '/:franchiseUserId',
    InternalPermissionMiddleware(PERMISSION.USERS_VIEW),
    InternalFranchiseUserMiddleware(),
    Wrapper(async (req, res) => {
      const { franchiseUser } = req.internal;
      throw RESULT.SUCCESS({ details: { franchiseUser } });
    })
  );

  router.post(
    '/:franchiseUserId',
    InternalPermissionMiddleware(PERMISSION.USERS_MODIFY),
    InternalFranchiseUserMiddleware(),
    Wrapper(async (req, res) => {
      const { body, internal } = req;
      await User.modifyUser(internal.franchiseUser, body);
      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/:franchiseUserId',
    InternalPermissionMiddleware(PERMISSION.USERS_DELETE),
    InternalFranchiseUserMiddleware(),
    Wrapper(async (req, res) => {
      const { franchise, franchiseUser } = req.internal;
      await User.deleteUser(franchise, franchiseUser);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
