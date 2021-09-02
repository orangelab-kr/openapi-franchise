import { Callback, InternalError, OPCODE, User, Wrapper } from '..';

export function FranchiseUserMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const {
      loggined: { franchise },
      params: { franchiseUserId },
    } = req;

    if (!franchise || !franchiseUserId) {
      throw new InternalError(
        '해당 사용자를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    const franchiseUser = await User.getUserOrThrow(franchise, franchiseUserId);
    req.franchiseUser = franchiseUser;

    next();
  });
}
