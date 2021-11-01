import { Franchise, RESULT, Wrapper, WrapperCallback } from '../../..';

export * from './user';

export function InternalFranchiseMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const { franchiseId } = req.params;
    if (!franchiseId) throw RESULT.CANNOT_FIND_FRANCHISE();
    const franchise = await Franchise.getFranchiseOrThrow(franchiseId);
    req.internal.franchise = franchise;

    next();
  });
}
