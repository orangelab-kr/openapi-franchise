import { Callback, InternalError, OPCODE, Session, Wrapper } from '..';

export function FranchiseMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const { headers } = req;
    if (!headers.authorization) {
      throw new InternalError(
        '로그인이 필요한 서비스입니다.',
        OPCODE.REQUIRED_LOGIN
      );
    }

    const franchiseUserSessionId = headers.authorization.substr(7);
    const session = await Session.getUserSession(franchiseUserSessionId);

    req.loggined = <any>{};
    req.loggined.franchise = session.franchiseUser.franchise;
    req.loggined.franchiseUser = session.franchiseUser;

    next();
  });
}
