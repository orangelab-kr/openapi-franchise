import { Router } from 'express';
import { FranchiseMiddleware, RESULT, Session, User, Wrapper } from '..';

export function getAuthRouter(): Router {
  const router = Router();

  router.get(
    '/',
    FranchiseMiddleware(),
    Wrapper(async (req, res) => {
      const { franchiseUser } = req.loggined;
      throw RESULT.SUCCESS({ details: { franchiseUser } });
    })
  );

  router.post(
    '/',
    FranchiseMiddleware(),
    Wrapper(async (req, res) => {
      const { body, loggined } = req;
      delete body.permissionGroupId;
      await User.modifyUser(loggined.franchiseUser, body);
      throw RESULT.SUCCESS();
    })
  );

  router.post(
    '/email',
    Wrapper(async (req, res) => {
      const { headers, body } = req;
      const userAgent = headers['user-agent'];
      const franchiseUser = await Session.loginUserByEmail(body);
      const sessionId = await Session.createSession(franchiseUser, userAgent);
      throw RESULT.SUCCESS({ details: { sessionId } });
    })
  );

  router.post(
    '/phone',
    Wrapper(async (req, res) => {
      const { headers, body } = req;
      const userAgent = headers['user-agent'];
      const franchiseUser = await Session.loginUserByPhone(body);
      const sessionId = await Session.createSession(franchiseUser, userAgent);
      throw RESULT.SUCCESS({ details: { sessionId } });
    })
  );

  router.delete(
    '/',
    FranchiseMiddleware(),
    Wrapper(async (req, res) => {
      await Session.revokeAllSession(req.loggined.franchiseUser);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
