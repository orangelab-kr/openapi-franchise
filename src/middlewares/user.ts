import { RESULT, User, Wrapper, WrapperCallback } from '..';

export function FranchiseUserMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const {
      loggined: { franchise },
      params: { franchiseUserId },
    } = req;

    if (!franchise || !franchiseUserId) throw RESULT.CANNOT_FIND_USER();
    req.franchiseUser = await User.getUserOrThrow(franchise, franchiseUserId);
    next();
  });
}
