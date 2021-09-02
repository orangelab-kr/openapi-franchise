import { FranchiseModel, PermissionGroupModel, Prisma } from '@prisma/client';
import { Database, InternalError, Joi, OPCODE, PATTERN } from '../tools';

const { prisma } = Database;
export class PermissionGroup {
  /** 권한 그룹을 불러옵니다. 없으면 오류를 발생합니다. */
  public static async getPermissionGroupOrThrow(
    permissionGroupId: string,
    franchise?: FranchiseModel
  ): Promise<PermissionGroupModel> {
    const permissionGroup = await PermissionGroup.getPermissionGroup(
      permissionGroupId,
      franchise
    );

    if (!permissionGroup) {
      throw new InternalError(
        '해당 권한 그룹을 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return permissionGroup;
  }

  /** 권한 그룹을 가져옵니다. */
  public static async getPermissionGroup(
    permissionGroupId: string,
    franchise?: FranchiseModel
  ): Promise<PermissionGroupModel | null> {
    const OR: any = [{ franchiseId: null }];
    if (franchise) {
      const { franchiseId } = franchise;
      OR.push({ franchiseId });
    }

    const { findFirst } = prisma.permissionGroupModel;
    const permissionGroup = await findFirst({
      where: { permissionGroupId, OR },
      include: { franchise: true, permissions: true },
    });

    return permissionGroup;
  }

  /** 권한 그룹 목록을 가져옵니다. */
  public static async getPermissionGroups(
    props: {
      take?: number;
      skip?: number;
      search?: string;
      orderByField?: string;
      orderBySort?: string;
    },
    franchise?: FranchiseModel
  ): Promise<{ total: number; permissionGroups: PermissionGroupModel[] }> {
    const schema = Joi.object({
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
      orderBySort: PATTERN.PAGINATION.ORDER_BY.SORT,
      orderByField: PATTERN.PAGINATION.ORDER_BY.FIELD.default('name').valid(
        'permissionGroupId',
        'name',
        'createdAt'
      ),
    });

    const {
      take,
      skip,
      search,
      orderByField,
      orderBySort,
    } = await schema.validateAsync(props);
    const orderBy = { [orderByField]: orderBySort };
    const where: any = {
      name: { contains: search },
      OR: [{ franchiseId: null }],
    };

    if (franchise) {
      const { franchiseId } = franchise;
      where.OR.push({ franchiseId });
    }

    const [total, permissionGroups] = await prisma.$transaction([
      prisma.permissionGroupModel.count({ where }),
      prisma.permissionGroupModel.findMany({
        take,
        skip,
        where,
        orderBy,
      }),
    ]);

    return { total, permissionGroups };
  }

  /** 권한 그룹을 생성합니다. */
  public static async createPermissionGroup(
    props: {
      name: string;
      permissions: string[];
    },
    franchise?: FranchiseModel
  ): Promise<PermissionGroupModel> {
    const schema = Joi.object({
      name: PATTERN.PERMISSION.GROUP.NAME,
      description: PATTERN.PERMISSION.GROUP.DESCRIPTION,
      permissionIds: PATTERN.PERMISSION.MULTIPLE,
    });

    const { name, description, permissionIds } = await schema.validateAsync(
      props
    );

    const data: Prisma.PermissionGroupModelCreateInput = {
      name,
      description,
      permissions: {
        connect: permissionIds.map((permissionId: string) => ({
          permissionId,
        })),
      },
    };

    if (franchise) {
      const { franchiseId } = franchise;
      data.franchise = { connect: { franchiseId } };
    }

    const permissionGroup = await prisma.permissionGroupModel.create({
      data,
    });

    return permissionGroup;
  }

  /** 권한 그룹을 수정합니다. */
  public static async modifyPermissionGroup(
    permissionGroupId: string,
    props: { name: string; description: string; permissionIds: string[] },
    franchise?: FranchiseModel
  ): Promise<void> {
    const schema = Joi.object({
      name: PATTERN.PERMISSION.NAME,
      description: PATTERN.PERMISSION.GROUP.DESCRIPTION,
      permissionIds: PATTERN.PERMISSION.MULTIPLE,
    });

    const { name, description, permissionIds } = await schema.validateAsync(
      props
    );

    if (franchise) {
      await PermissionGroup.getPermissionGroupOrThrow(
        permissionGroupId,
        franchise
      );
    }

    await prisma.permissionGroupModel.update({
      where: { permissionGroupId },
      data: {
        name,
        description,
        permissions: {
          set: permissionIds.map((permissionId: string) => ({ permissionId })),
        },
      },
    });
  }

  /** 권한 그룹을 삭제합니다. */
  public static async deletePermissionGroup(
    permissionGroupId: string,
    franchise?: FranchiseModel
  ): Promise<void> {
    const include = { users: true };
    const where: Prisma.PermissionGroupModelWhereInput = {
      permissionGroupId,
      OR: [{ franchiseId: null }],
    };

    if (franchise && where.OR instanceof Array) {
      const { franchiseId } = franchise;
      where.OR.push({ franchiseId });
    }

    const { findFirst, deleteMany } = prisma.permissionGroupModel;
    const permissionGroup = await findFirst({ where, include });

    if (!permissionGroup) {
      throw new InternalError(
        '해당 권한 그룹을 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    const { users } = permissionGroup;
    if (users.length > 0) {
      throw new InternalError(
        `해당 권한 그룹을 사용하는 사용자가 있습니다.`,
        OPCODE.ERROR,
        { users }
      );
    }

    await deleteMany({ where: { permissionGroupId } });
  }
}
