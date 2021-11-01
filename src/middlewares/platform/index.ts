import { PlatformPermission } from 'openapi-internal-sdk';
import { InternalClient, Wrapper, WrapperCallback } from '../..';

export * from './franchise';

export function PlatformMiddleware(
  props: {
    permissionIds?: string[];
    final?: boolean;
  } = {}
): WrapperCallback {
  const { permissionIds, final } = {
    permissionIds: [],
    final: false,
    ...props,
  };

  const platformClient = InternalClient.getPlatform([
    PlatformPermission.PLATFORM_USER_AUTHORIZE,
    PlatformPermission.PLATFORM_ACCESS_KEY_AUTHORIZE,
  ]);

  return Wrapper(async (req, res, next) => {
    if (!req.platform) req.platform = <any>{};
    if (req.platform.permissionIds === undefined) {
      req.platform.permissionIds = [];
    }

    req.platform.permissionIds.push(...permissionIds);
    if (!final) return next();
    const { headers } = req;
    const {
      authorization,
      'x-hikick-platform-access-key-id': platformAccessKeyId,
      'x-hikick-platform-secret-access-key': platformSecretAccessKey,
    } = headers;
    if (
      typeof platformAccessKeyId === 'string' &&
      typeof platformSecretAccessKey === 'string'
    ) {
      const accessKey = await platformClient.getAccessKeyWithPermissions({
        platformAccessKeyId,
        platformSecretAccessKey,
        permissionIds,
      });

      const { platform } = accessKey;
      req.platform.platform = platform;
      req.platform.accessKey = accessKey;
    } else {
      const sessionId = `${authorization}`.substr(7);
      const user = await platformClient.getUserWithPermissions({
        sessionId,
        permissionIds,
      });

      const { platform } = user;
      req.platform.platform = platform;
      req.platform.user = user;
    }

    next();
  });
}
