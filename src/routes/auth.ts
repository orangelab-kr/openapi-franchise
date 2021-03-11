import { FranchiseMiddleware } from '../middlewares';
import { OPCODE } from '../tools';
import { Router } from 'express';
import Session from '../controllers/session';
import { User } from '../controllers';
import Wrapper from '../tools/wrapper';

export default function getAuthRouter(): Router {
  const router = Router();

  router.get(
    '/',
    FranchiseMiddleware(),
    Wrapper(async (req, res) => {
      const { franchiseUser } = req.loggined;
      res.json({
        opcode: OPCODE.SUCCESS,
        franchiseUser,
      });
    })
  );

  router.post(
    '/',
    FranchiseMiddleware(),
    Wrapper(async (req, res) => {
      const { body, loggined } = req;
      delete body.permissionGroupId;
      await User.modifyUser(loggined.franchiseUser, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.post(
    '/email',
    Wrapper(async (req, res) => {
      const { headers, body } = req;
      const userAgent = headers['user-agent'];
      const franchiseUser = await Session.loginUserByEmail(body);
      const sessionId = await Session.createSession(franchiseUser, userAgent);
      res.json({ opcode: OPCODE.SUCCESS, sessionId });
    })
  );

  router.post(
    '/phone',
    Wrapper(async (req, res) => {
      const { headers, body } = req;
      const userAgent = headers['user-agent'];
      const franchiseUser = await Session.loginUserByPhone(body);
      const sessionId = await Session.createSession(franchiseUser, userAgent);
      res.json({ opcode: OPCODE.SUCCESS, sessionId });
    })
  );

  router.delete(
    '/',
    FranchiseMiddleware(),
    Wrapper(async (req, res) => {
      await Session.revokeAllSession(req.loggined.franchiseUser);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
