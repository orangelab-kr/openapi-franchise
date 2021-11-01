import { RESULT, Wrapper, WrapperCallback } from '../..';

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

export function InternalPermissionMiddleware(
  permission: PERMISSION
): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    if (!req.internal.prs[permission]) {
      throw RESULT.PERMISSION_DENIED({ args: [PERMISSION[permission]] });
    }

    next();
  });
}
