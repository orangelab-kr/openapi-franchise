import { FranchiseLogType } from '@prisma/client';
import { Router } from 'express';
import { Log, OPCODE, PermissionGroup, Wrapper } from '..';

export function getPermissionGroupsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { query, loggined } = req;
      const {
        total,
        permissionGroups,
      } = await PermissionGroup.getPermissionGroups(query, loggined.franchise);
      res.json({ opcode: OPCODE.SUCCESS, permissionGroups, total });
    })
  );

  router.get(
    '/:permissionGroupId',
    Wrapper(async (req, res) => {
      const {
        loggined: { franchise },
        params: { permissionGroupId },
      } = req;
      const permissionGroup = await PermissionGroup.getPermissionGroupOrThrow(
        permissionGroupId,
        franchise
      );

      res.json({ opcode: OPCODE.SUCCESS, permissionGroup });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const { loggined, body } = req;
      const { permissionGroupId } = await PermissionGroup.createPermissionGroup(
        body,
        loggined.franchise
      );

      Log.createRequestLog(
        req,
        FranchiseLogType.PERMISSION_GROUP_CREATE,
        `${permissionGroupId} 권한 그룹을 생성하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS, permissionGroupId });
    })
  );

  router.post(
    '/:permissionGroupId',
    Wrapper(async (req, res) => {
      const {
        body,
        loggined: { franchise },
        params: { permissionGroupId },
      } = req;
      await PermissionGroup.modifyPermissionGroup(
        permissionGroupId,
        body,
        franchise
      );

      Log.createRequestLog(
        req,
        FranchiseLogType.PERMISSION_GROUP_MODIFY,
        `${permissionGroupId} 권한 그룹을 수정하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:permissionGroupId',
    Wrapper(async (req, res) => {
      const {
        loggined: { franchise },
        params: { permissionGroupId },
      } = req;
      await PermissionGroup.deletePermissionGroup(permissionGroupId, franchise);
      Log.createRequestLog(
        req,
        FranchiseLogType.PERMISSION_GROUP_DELETE,
        `${permissionGroupId} 권한 그룹을 삭제하였습니다.`
      );

      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
