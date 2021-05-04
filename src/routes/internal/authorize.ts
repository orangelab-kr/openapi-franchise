import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

import { Router } from 'express';
import Session from '../../controllers/session';

export function getInternalAuthorizeRouter(): Router {
  const router = Router();

  router.post(
    '/user',
    InternalPermissionMiddleware(PERMISSION.AUTHORIZE_USER),
    Wrapper(async (req, res) => {
      const franchiseUser = await Session.authorizeWithSessionId(req.body);
      res.json({ opcode: OPCODE.SUCCESS, franchiseUser });
    })
  );

  return router;
}
