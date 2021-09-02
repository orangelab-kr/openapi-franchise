import {
  FranchiseModel,
  FranchiseUserMethodProvider,
  FranchiseUserModel,
  PermissionGroupModel,
  PermissionModel,
  Prisma,
} from '@prisma/client';
import { hashSync } from 'bcryptjs';
import { InternalError, Joi, OPCODE, PATTERN, PermissionGroup } from '..';
import { Database } from '../tools';

const { prisma } = Database;

export class User {
  public static hasPermissions(
    user: FranchiseUserModel & {
      franchise: FranchiseModel;
      permissionGroup: PermissionGroupModel & {
        permissions: PermissionModel[];
      };
    },
    requiredPermissions: string[]
  ): void {
    const permissions = user.permissionGroup.permissions.map(
      ({ permissionId }: { permissionId: string }) => permissionId
    );

    requiredPermissions.forEach((permission: string) => {
      if (!permissions.includes(permission)) {
        throw new InternalError(
          `접근할 권한이 없습니다. (${permission})`,
          OPCODE.ACCESS_DENIED
        );
      }
    });
  }

  /** 사용자를 생성합니다. */
  public static async createUser(
    franchise: FranchiseModel,
    props: {
      name: string;
      email: string;
      phone: string;
      password: string;
      permissionGroup: string;
    }
  ): Promise<FranchiseUserModel> {
    const schema = Joi.object({
      name: PATTERN.FRANCHISE.USER.NAME,
      email: PATTERN.FRANCHISE.USER.EMAIL,
      phone: PATTERN.FRANCHISE.USER.PHONE,
      permissionGroupId: PATTERN.PERMISSION.GROUP.ID,
      password: PATTERN.FRANCHISE.USER.PASSWORD,
    });

    const {
      name,
      email,
      phone,
      password,
      permissionGroupId,
    } = await schema.validateAsync(props);
    const isExists = await Promise.all([
      User.isExistsFranchiseUserEmail(email),
      User.isExistsFranchiseUserPhone(phone),
    ]);

    if (isExists[0]) {
      throw new InternalError('사용중인 이메일입니다.', OPCODE.ALREADY_EXISTS);
    }

    if (isExists[1]) {
      throw new InternalError(
        '사용중인 전화번호입니다.',
        OPCODE.ALREADY_EXISTS
      );
    }

    await PermissionGroup.getPermissionGroupOrThrow(permissionGroupId);

    const { franchiseId } = franchise;
    const identity = hashSync(password, 10);
    const user = await prisma.franchiseUserModel.create({
      data: {
        name,
        email,
        phone,
        methods: { create: { provider: 'LOCAL', identity } },
        permissionGroup: { connect: { permissionGroupId } },
        franchise: { connect: { franchiseId } },
      },
    });

    return user;
  }

  /** 사용자를 수정합니다. */
  public static async modifyUser(
    user: FranchiseUserModel,
    props: {
      name: string;
      email: string;
      phone: string;
      password: string;
      permissionGroupId: string;
    }
  ): Promise<FranchiseUserModel> {
    const schema = Joi.object({
      name: PATTERN.FRANCHISE.USER.NAME.optional(),
      email: PATTERN.FRANCHISE.USER.EMAIL.optional(),
      phone: PATTERN.FRANCHISE.USER.PHONE.optional(),
      permissionGroupId: PATTERN.PERMISSION.GROUP.ID.optional(),
      password: PATTERN.FRANCHISE.USER.PASSWORD.optional(),
    });

    const {
      name,
      email,
      phone,
      password,
      permissionGroupId,
    } = await schema.validateAsync(props);
    const isExists = await Promise.all([
      User.isExistsFranchiseUserEmail(email),
      User.isExistsFranchiseUserPhone(phone),
    ]);

    if (email && user.email !== email && isExists[0]) {
      throw new InternalError('사용중인 이메일입니다.', OPCODE.ALREADY_EXISTS);
    }

    if (phone && user.phone !== phone && isExists[1]) {
      throw new InternalError(
        '사용중인 전화번호입니다.',
        OPCODE.ALREADY_EXISTS
      );
    }

    const data: Prisma.FranchiseUserModelUpdateInput = {
      name,
      email,
      phone,
    };

    if (permissionGroupId) {
      await PermissionGroup.getPermissionGroupOrThrow(permissionGroupId);
      data.permissionGroup = { connect: { permissionGroupId } };
    }

    if (password) {
      const provider = FranchiseUserMethodProvider.LOCAL;
      const identity = hashSync(password, 10);
      data.methods = {
        deleteMany: { provider },
        create: { provider, identity },
      };
    }

    const { franchiseUserId } = user;
    const where = { franchiseUserId };
    await prisma.franchiseUserModel.update({ where, data });
    return user;
  }

  /** 사용자 목록을 가져옵니다. */
  public static async getUsers(
    franchise: FranchiseModel,
    props: {
      take?: number;
      skip?: number;
      search?: number;
      orderByField?: string;
      orderBySort?: string;
    }
  ): Promise<{ total: number; franchiseUsers: FranchiseUserModel[] }> {
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

    const {
      take,
      skip,
      search,
      orderByField,
      orderBySort,
    } = await schema.validateAsync(props);
    const { franchiseId } = franchise;
    const orderBy = { [orderByField]: orderBySort };
    const where: Prisma.FranchiseUserModelWhereInput = {
      franchise: { franchiseId },
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ],
    };

    const [total, franchiseUsers] = await prisma.$transaction([
      prisma.franchiseUserModel.count({ where }),
      prisma.franchiseUserModel.findMany({
        take,
        skip,
        where,
        orderBy,
      }),
    ]);

    return { total, franchiseUsers };
  }

  /** 사용자를 불러옵니다. 없을 경우 오류를 발생합니다. */
  public static async getUserOrThrow(
    franchise: FranchiseModel,
    franchiseUserId: string
  ): Promise<FranchiseUserModel> {
    const user = await User.getUser(franchise, franchiseUserId);
    if (!user) {
      throw new InternalError(
        '해당 사용자를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return user;
  }

  /** 이메일로 사용자를 가져옵니다. 없을 경우 오류를 발생합니다. */
  public static async getUserByEmailOrThrow(
    email: string
  ): Promise<FranchiseUserModel> {
    const user = await User.getUserByEmail(email);
    if (!user) {
      throw new InternalError(
        '해당 사용자를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return user;
  }

  /** 전화번호로 사용자를 가져옵니다. */
  public static async getUserByPhone(
    phone: string
  ): Promise<FranchiseUserModel | null> {
    const user = await prisma.franchiseUserModel.findFirst({
      where: { phone },
    });

    return user;
  }

  /** 전화번호로 사용자를 가져옵니다. 없을 경우 오류를 발생합니다. */
  public static async getUserByPhoneOrThrow(
    phone: string
  ): Promise<FranchiseUserModel> {
    const user = await User.getUserByPhone(phone);
    if (!user) {
      throw new InternalError(
        '해당 사용자를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return user;
  }

  /** 이메일로 사용자를 가져옵니다. */
  public static async getUserByEmail(
    email: string
  ): Promise<FranchiseUserModel | null> {
    const user = await prisma.franchiseUserModel.findFirst({
      where: { email },
    });

    return user;
  }

  /** 사용자를 불러옵니다. */
  public static async getUser(
    franchise: FranchiseModel,
    franchiseUserId: string
  ): Promise<FranchiseUserModel | null> {
    const { franchiseId } = franchise;
    const user = await prisma.franchiseUserModel.findFirst({
      where: { franchiseUserId, franchise: { franchiseId } },
      include: { permissionGroup: true },
    });

    return user;
  }

  /** 해당 이메일이 사용중인지 확인합니다. */
  public static async isExistsFranchiseUserEmail(
    email: string
  ): Promise<boolean> {
    const exists = await prisma.franchiseUserModel.count({ where: { email } });
    return exists > 0;
  }

  /** 해당 전화번호가 사용중인지 확인합니다. */
  public static async isExistsFranchiseUserPhone(
    phone: string
  ): Promise<boolean> {
    const exists = await prisma.franchiseUserModel.count({ where: { phone } });
    return exists > 0;
  }

  /** 사용자를 삭제합니다. */
  public static async deleteUser(
    franchise: FranchiseModel,
    user: FranchiseUserModel
  ): Promise<void> {
    const { franchiseId } = franchise;
    const { franchiseUserId } = user;
    await prisma.franchiseUserMethodModel.deleteMany({
      where: { franchiseUserId },
    });

    await prisma.franchiseUserModel.deleteMany({
      where: { franchise: { franchiseId }, franchiseUserId },
    });
  }
}
