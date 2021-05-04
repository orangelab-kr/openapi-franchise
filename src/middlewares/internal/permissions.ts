import Wrapper, { Callback } from '../../tools/wrapper';

import InternalError from '../../tools/error';
import { OPCODE } from '../../tools';

export enum PERMISSION {
  FRANCHISES_LIST,
  FRANCHISES_VIEW,
  FRANCHISES_CREATE,
  FRANCHISES_MODIFY,
  FRANCHISES_DELETE,

  USERS_LIST,
  USERS_VIEW,
  USERS_CREATE,
  USERS_MODIFY,
  USERS_DELETE,

  PERMISSIONS_LIST,
  PERMISSIONS_VIEW,
  PERMISSIONS_CREATE,
  PERMISSIONS_MODIFY,
  PERMISSIONS_DELETE,

  PERMISSION_GROUPS_LIST,
  PERMISSION_GROUPS_VIEW,
  PERMISSION_GROUPS_CREATE,
  PERMISSION_GROUPS_MODIFY,
  PERMISSION_GROUPS_DELETE,

  LOGS_LIST,
  LOGS_VIEW,

  AUTHORIZE_USER,
}

export default function InternalPermissionMiddleware(
  permission: PERMISSION
): Callback {
  return Wrapper(async (req, res, next) => {
    if (!req.internal.prs[permission]) {
      throw new InternalError(
        `${PERMISSION[permission]} 권한이 없습니다.`,
        OPCODE.ACCESS_DENIED
      );
    }

    await next();
  });
}
