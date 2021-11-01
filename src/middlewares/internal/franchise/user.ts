import { RESULT, User, Wrapper, WrapperCallback } from '../../..';

export function InternalFranchiseUserMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const {
      internal: { franchise },
      params: { franchiseUserId },
    } = req;

    if (!franchise || !franchiseUserId) throw RESULT.CANNOT_FIND_USER();
    const franchiseUser = await User.getUserOrThrow(franchise, franchiseUserId);
    req.internal.franchiseUser = franchiseUser;

    next();
  });
}
