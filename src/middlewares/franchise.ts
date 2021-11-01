import { RESULT, Session, Wrapper, WrapperCallback } from '..';

export function FranchiseMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const { headers } = req;
    if (!headers.authorization) throw RESULT.REQUIRED_LOGIN();
    const franchiseUserSessionId = headers.authorization.substr(7);
    const session = await Session.getUserSession(franchiseUserSessionId);

    req.loggined = <any>{};
    req.loggined.franchise = session.franchiseUser.franchise;
    req.loggined.franchiseUser = session.franchiseUser;

    next();
  });
}
