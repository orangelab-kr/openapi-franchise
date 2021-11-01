import { prisma, InternalError, Joi, OPCODE, PATTERN } from '..';
import { FranchiseModel, Prisma } from '@prisma/client';

export class Franchise {
  /** 프렌차이즈를 생성합니다. */
  public static async createFranchise(props: {
    name: string;
    paymentKeyId?: string;
  }): Promise<FranchiseModel> {
    const schema = Joi.object({
      name: PATTERN.FRANCHISE.NAME,
      paymentKeyId: PATTERN.FRANCHISE.PAYMENT_KEY_ID,
    });

    const { name } = await schema.validateAsync(props);
    const exists = await Franchise.isExistsFranchiseName(name);
    if (exists) {
      throw new InternalError(
        '이미 존재하는 프렌차이즈 이름입니다.',
        OPCODE.ALREADY_EXISTS
      );
    }

    const franchise = await prisma.franchiseModel.create({
      data: { name },
    });

    return franchise;
  }

  /** 프렌차이즈를 수정합니다. */
  public static async modifyFranchise(
    franchise: FranchiseModel,
    props: {
      name?: string;
      paymentKeyId?: string;
    }
  ): Promise<void> {
    const schema = Joi.object({
      name: PATTERN.FRANCHISE.NAME,
      paymentKeyId: PATTERN.FRANCHISE.PAYMENT_KEY_ID,
    });

    const { franchiseId, name } = franchise;
    const data = await schema.validateAsync(props);
    if (name !== props.name) {
      const exists = await Franchise.isExistsFranchiseName(name);
      if (exists) {
        throw new InternalError(
          '이미 존재하는 프렌차이즈 이름입니다.',
          OPCODE.ALREADY_EXISTS
        );
      }
    }

    await prisma.franchiseModel.update({
      where: { franchiseId },
      data,
    });
  }

  /** 프렌차이즈를 가져옵니다. 없을 경우 오류를 발생합니다. */
  public static async getFranchiseOrThrow(
    franchiseId: string
  ): Promise<FranchiseModel> {
    const franchise = await Franchise.getFranchise(franchiseId);
    if (!franchise) {
      throw new InternalError(
        '해당 프렌차이즈를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return franchise;
  }

  /** 프렌차이즈를 가져옵니다. */
  public static async getFranchise(
    franchiseId: string
  ): Promise<FranchiseModel | null> {
    const franchise = await prisma.franchiseModel.findFirst({
      where: { franchiseId },
    });

    return franchise;
  }

  /** 프렌차이즈 목록을 가져옵니다. */
  public static async getFranchises(props: {
    take?: number;
    skip?: number;
    search?: number;
    orderByField?: string;
    orderBySort?: string;
  }): Promise<{ total: number; franchises: FranchiseModel[] }> {
    const schema = Joi.object({
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
      orderByField: PATTERN.PAGINATION.ORDER_BY.FIELD.valid(
        'name',
        'createdAt'
      ).default('name'),
      orderBySort: PATTERN.PAGINATION.ORDER_BY.SORT,
    });

    const { take, skip, search, orderByField, orderBySort } =
      await schema.validateAsync(props);
    const orderBy = { [orderByField]: orderBySort };
    const where: Prisma.FranchiseModelWhereInput = {
      OR: [
        { franchiseId: { contains: search } },
        { name: { contains: search } },
      ],
    };

    const [total, franchises] = await prisma.$transaction([
      prisma.franchiseModel.count({ where }),
      prisma.franchiseModel.findMany({
        take,
        skip,
        where,
        orderBy,
      }),
    ]);

    return { total, franchises };
  }

  /** 프렌차이즈 이름이 존재하는지 확인합니다. */
  public static async isExistsFranchiseName(name: string): Promise<boolean> {
    const exists = await prisma.franchiseModel.count({
      where: { name },
    });

    return exists > 0;
  }

  /** 프렌차이즈를 삭제합니다. */
  public static async deleteFranchise(
    franchise: FranchiseModel
  ): Promise<void> {
    const { franchiseId } = franchise;
    await prisma.franchiseModel.deleteMany({ where: { franchiseId } });
  }
}
