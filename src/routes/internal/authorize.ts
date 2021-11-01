import { Router } from 'express';
import {
  InternalPermissionMiddleware,
  PERMISSION,
  RESULT,
  Session,
  Wrapper,
} from '../..';

export function getInternalAuthorizeRouter(): Router {
  const router = Router();

  router.post(
    '/user',
    InternalPermissionMiddleware(PERMISSION.AUTHORIZE_USER),
    Wrapper(async (req) => {
      const franchiseUser = await Session.authorizeWithSessionId(req.body);
      throw RESULT.SUCCESS({ details: { franchiseUser } });
    })
  );

  return router;
}
