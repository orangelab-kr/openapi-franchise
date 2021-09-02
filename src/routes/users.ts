import { FranchiseLogType } from '@prisma/client';
import { Router } from 'express';
import { FranchiseUserMiddleware, Log, OPCODE, User, Wrapper } from '..';

export function getUserRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { loggined, query } = req;
      const { total, franchiseUsers } = await User.getUsers(
        loggined.franchise,
        query
      );

      res.json({ opcode: OPCODE.SUCCESS, franchiseUsers, total });
    })
  );

  router.get(
    '/:franchiseUserId',
    FranchiseUserMiddleware(),
    Wrapper(async (req, res) => {
      const { franchiseUser } = req;
      res.json({ opcode: OPCODE.SUCCESS, franchiseUser });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const { loggined, body } = req;
      const { franchiseUserId } = await User.createUser(
        loggined.franchise,
        body
      );

      Log.createRequestLog(
        req,
        FranchiseLogType.USER_CREATE,
        `${franchiseUserId} 사용자를 추가하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS, franchiseUserId });
    })
  );

  router.post(
    '/:franchiseUserId',
    FranchiseUserMiddleware(),
    Wrapper(async (req, res) => {
      const { franchiseUser, body } = req;
      const { franchiseUserId } = franchiseUser;
      await User.modifyUser(franchiseUser, body);
      Log.createRequestLog(
        req,
        FranchiseLogType.USER_MODIFY,
        `${franchiseUserId} 사용자를 수정하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:franchiseUserId',
    FranchiseUserMiddleware(),
    Wrapper(async (req, res) => {
      const { loggined, franchiseUser } = req;
      const { franchiseUserId } = franchiseUser;
      await User.deleteUser(loggined.franchise, franchiseUser);
      Log.createRequestLog(
        req,
        FranchiseLogType.USER_DELETE,
        `${franchiseUserId} 사용자를 삭제하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
