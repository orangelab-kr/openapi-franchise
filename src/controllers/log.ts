import {
  FranchiseLogModel,
  FranchiseLogType,
  FranchiseModel,
  FranchiseUserModel,
  Prisma,
} from '@prisma/client';
import { Request } from 'express';
import { InternalError, Joi, OPCODE, PATTERN, prisma } from '..';

export class Log {
  /** HTTP 요청을 기록합니다. */
  public static async createRequestLog(
    req: Request,
    franchiseLogType: FranchiseLogType,
    message: string
  ): Promise<void> {
    const {
      franchise: { franchiseId },
      franchiseUser: { franchiseUserId },
    } = req.loggined;

    if (!franchiseId || !franchiseUserId) {
      throw new InternalError(
        '알 수 없는 오류가 발생하였습니다.',
        OPCODE.ERROR
      );
    }

    await prisma.franchiseLogModel.create({
      data: {
        franchiseId,
        franchiseUserId,
        franchiseLogType,
        message,
      },
    });
  }

  /** 사용자 요청을 기록합니다. */
  public static async createUserLog(
    franchiseUser: FranchiseUserModel,
    franchiseLogType: FranchiseLogType,
    message: string
  ): Promise<void> {
    const { franchiseId, franchiseUserId } = franchiseUser;
    await prisma.franchiseLogModel.create({
      data: {
        franchiseId,
        franchiseUserId,
        franchiseLogType,
        message,
      },
    });
  }

  /** 로그를 확인합니다. */
  public static async getLogs(
    props: {
      take?: number;
      skip?: number;
      search?: string;
      franchiseLogType?: string[];
      franchiseUserId?: string;
      orderByField?: string;
      orderBySort?: string;
    },
    franchise?: FranchiseModel
  ): Promise<{
    total: number;
    franchiseLogs: (FranchiseLogModel & {
      franchise: FranchiseModel;
      franchiseUser?: FranchiseUserModel;
    })[];
  }> {
    const schema = Joi.object({
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
      franchiseLogType: PATTERN.FRANCHISE.LOG.TYPE.optional(),
      franchiseUserId: PATTERN.FRANCHISE.USER.ID.optional(),
      orderByField:
        PATTERN.PAGINATION.ORDER_BY.FIELD.valid('createdAt').default(
          'createdAt'
        ),
      orderBySort: PATTERN.PAGINATION.ORDER_BY.SORT.default('desc'),
    });

    const {
      take,
      skip,
      search,
      franchiseLogType,
      franchiseUserId,
      orderByField,
      orderBySort,
    } = await schema.validateAsync(props);
    const where: Prisma.FranchiseLogModelWhereInput = {};
    if (franchise) where.franchiseId = franchise.franchiseId;
    if (franchiseUserId) where.franchiseUserId = franchiseUserId;
    if (franchiseLogType) where.franchiseLogType = { in: franchiseLogType };
    if (search) where.message = { contains: search };
    const orderBy = { [orderByField]: orderBySort };
    const include: Prisma.FranchiseLogModelInclude = {
      franchise: true,
      franchiseUser: true,
    };

    const [total, franchiseLogs]: [number, any] = await prisma.$transaction([
      prisma.franchiseLogModel.count({ where }),
      prisma.franchiseLogModel.findMany({
        include,
        orderBy,
        where,
        take,
        skip,
      }),
    ]);

    return { total, franchiseLogs };
  }

  /** 특정 로그를 확인합니다. 없을 경우 오류가 발생합니다 */
  public static async getLogOrThrow(
    franchiseLogId: string,
    franchise?: FranchiseModel
  ): Promise<
    FranchiseLogModel & {
      franchise: FranchiseModel;
      franchiseUser?: FranchiseUserModel;
    }
  > {
    const log = await Log.getLog(franchiseLogId, franchise);
    if (!log) {
      throw new InternalError(
        '해당 로그를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return log;
  }

  /** 특정 로그를 확인합니다. */
  public static async getLog(
    franchiseLogId: string,
    franchise?: FranchiseModel
  ): Promise<
    | (FranchiseLogModel & {
        franchise: FranchiseModel;
        franchiseUser?: FranchiseUserModel;
      })
    | null
  > {
    const where: Prisma.FranchiseLogModelWhereInput = { franchiseLogId };
    const include: Prisma.FranchiseLogModelInclude = {
      franchise: true,
      franchiseUser: true,
    };

    if (franchise) where.franchiseId = franchise.franchiseId;
    const franchiseLog: any = await prisma.franchiseLogModel.findFirst({
      where,
      include,
    });

    return franchiseLog;
  }
}
