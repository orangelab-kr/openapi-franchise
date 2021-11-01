import { Router } from 'express';
import { Permission, RESULT, Wrapper } from '..';

export function getPermissionRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { total, permissions } = await Permission.getPermissions(req.query);
      throw RESULT.SUCCESS({ details: { permissions, total } });
    })
  );

  router.get(
    '/:permissionId',
    Wrapper(async (req, res) => {
      const { permissionId } = req.params;
      const permission = await Permission.getPermissionOrThrow(permissionId);
      throw RESULT.SUCCESS({ details: { permission } });
    })
  );

  return router;
}
