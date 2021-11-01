import { WrapperResult, WrapperResultLazyProps } from '.';

export function $_$(
  opcode: number,
  statusCode: number,
  message?: string,
  reportable?: boolean
): (props?: WrapperResultLazyProps) => WrapperResult {
  return (lazyOptions: WrapperResultLazyProps = {}) =>
    new WrapperResult({
      opcode,
      statusCode,
      message,
      reportable,
      ...lazyOptions,
    });
}

export const RESULT = {
  /** SAME ERRORS  */
  SUCCESS: $_$(0, 200),
  REQUIRED_ACCESS_KEY: $_$(-801, 401, 'REQUIRED_ACCESS_KEY'),
  EXPIRED_ACCESS_KEY: $_$(-802, 401, 'EXPIRED_ACCESS_KEY'),
  PERMISSION_DENIED: $_$(-803, 403, 'PERMISSION_DENIED'),
  INVALID_ERROR: $_$(-804, 500, 'INVALID_ERROR'),
  FAILED_VALIDATE: $_$(-805, 400, 'FAILED_VALIDATE'),
  INVALID_API: $_$(-806, 404, 'INVALID_API'),
  /** CUSTOM ERRORS  */
  REQUIRED_LOGIN: $_$(-807, 400, 'REQUIRED_LOGIN'),
  ALREADY_EXISTS_FRANCHISE: $_$(-808, 409, 'ALREADY_EXISTS_FRANCHISE'),
  CANNOT_FIND_LOG: $_$(-809, 404, 'CANNOT_FIND_LOG'),
  CANNOT_FIND_PERMISSION: $_$(-810, 404, 'CANNOT_FIND_PERMISSION'),
  ALREADY_EXISTS_PERMISSION: $_$(-811, 409, 'ALREADY_EXISTS_PERMISSION'),
  CANNOT_FIND_PERMISSION_GROUP: $_$(-812, 404, 'CANNOT_FIND_PERMISSION_GROUP'),
  USING_PERMISSION_GROUP: $_$(-813, 409, 'USING_PERMISSION_GROUP'),
  CANNOT_FIND_FRANCHISE: $_$(-814, 404, 'CANNOT_FIND_FRANCHISE'),
  INVALID_EMAIL_OR_PASSWORD: $_$(-815, 401, 'INVALID_EMAIL_OR_PASSWORD'),
  INVALID_PHONE_OR_PASSWORD: $_$(-816, 401, 'INVALID_PHONE_OR_PASSWORD'),
  NOT_CONNECTED_WITH_METHOD: $_$(-817, 404, 'NOT_CONNECTED_WITH_METHOD'),
  CANNOT_FIND_USER: $_$(-818, 404, 'CANNOT_FIND_USER'),
  ALREADY_USING_EMAIL: $_$(-819, 409, 'ALREADY_USING_EMAIL'),
  ALREADY_USING_PHONE: $_$(-820, 409, 'ALREADY_USING_PHONE'),
};
