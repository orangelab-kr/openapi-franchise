import { Franchise, RESULT, Wrapper, WrapperCallback } from '../..';

export function PlatformFranchiseMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const { franchiseId } = req.params;
    if (!franchiseId) throw RESULT.CANNOT_FIND_FRANCHISE();
    const franchise = await Franchise.getFranchiseOrThrow(franchiseId);
    req.platform.franchise = franchise;

    next();
  });
}
