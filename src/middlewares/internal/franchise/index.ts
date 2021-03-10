import { InternalError, OPCODE } from '../../../tools';
import Wrapper, { Callback } from '../../../tools/wrapper';

import Franchise from '../../../controllers/franchise';

export { default as InternalFranchiseUserMiddleware } from './user';

export default function InternalFranchiseMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const { franchiseId } = req.params;
    if (!franchiseId) {
      throw new InternalError(
        '해당 프렌차이즈를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    const franchise = await Franchise.getFranchiseOrThrow(franchiseId);
    req.internal.franchise = franchise;

    next();
  });
}
