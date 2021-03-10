import { InternalError, OPCODE } from '../../../tools';
import Wrapper, { Callback } from '../../../tools/wrapper';

import User from '../../../controllers/user';

export default function InternalFranchiseUserMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const {
      internal: { franchise },
      params: { franchiseUserId },
    } = req;

    if (!franchise || !franchiseUserId) {
      throw new InternalError(
        '해당 사용자를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    const franchiseUser = await User.getUserOrThrow(franchise, franchiseUserId);
    req.internal.franchiseUser = franchiseUser;

    next();
  });
}