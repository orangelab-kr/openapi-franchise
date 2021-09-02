import {
  FranchiseLogType,
  FranchiseModel,
  FranchiseUserMethodModel,
  FranchiseUserMethodProvider,
  FranchiseUserModel,
  FranchiseUserSessionModel,
  PermissionGroupModel,
  PermissionModel,
} from '@prisma/client';
import { compareSync } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { InternalError, Joi, Log, OPCODE, PATTERN, User } from '..';
import { Database } from '../tools';

const { prisma } = Database;
export class Session {
  /** 해당 세션 아이디로 인증합니다. */
  public static async authorizeWithSessionId(props: {
    sessionId: string;
    permissionIds?: string[];
  }): Promise<FranchiseUserModel & { franchise: FranchiseModel }> {
    const schema = Joi.object({
      sessionId: PATTERN.FRANCHISE.USER.SESSION_ID,
      permissionIds: PATTERN.PERMISSION.MULTIPLE.optional(),
    });

    const { sessionId, permissionIds } = await schema.validateAsync(props);
    let session:
      | (FranchiseUserSessionModel & {
          franchiseUser: FranchiseUserModel & {
            franchise: FranchiseModel;
            permissionGroup: PermissionGroupModel & {
              permissions: PermissionModel[];
            };
          };
        })
      | undefined;

    try {
      session = await Session.getUserSession(sessionId);
    } catch (err) {
      throw new InternalError(
        '로그아웃되었습니다. 다시 로그인해주세요.',
        OPCODE.REQUIRED_LOGIN
      );
    }

    if (permissionIds) {
      User.hasPermissions(session.franchiseUser, permissionIds);
    }

    return session.franchiseUser;
  }

  /** 이메일, 비밀번호를 사용하여 로그인을 합니다. */
  public static async loginUserByEmail(props: {
    email: string;
    password: string;
  }): Promise<FranchiseUserModel> {
    try {
      const schema = Joi.object({
        email: PATTERN.FRANCHISE.USER.EMAIL,
        password: PATTERN.FRANCHISE.USER.PASSWORD,
      });

      const { email, password } = await schema.validateAsync(props);
      const franchiseUser = await User.getUserByEmailOrThrow(email);
      const method = await Session.getUserMethodOrThrow(
        franchiseUser,
        FranchiseUserMethodProvider.LOCAL
      );

      if (!compareSync(password, method.identity)) {
        throw new InternalError(
          '비밀번호가 일치하지 않습니다.',
          OPCODE.NOT_FOUND
        );
      }

      return franchiseUser;
    } catch (err) {
      throw new InternalError(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
        OPCODE.NOT_FOUND
      );
    }
  }

  /** 전화번호, 비밀번호를 사용하여 로그인을 합니다. */
  public static async loginUserByPhone(props: {
    phone: string;
    password: string;
  }): Promise<FranchiseUserModel> {
    try {
      const schema = Joi.object({
        phone: PATTERN.FRANCHISE.USER.PHONE,
        password: PATTERN.FRANCHISE.USER.PASSWORD,
      });

      const { phone, password } = await schema.validateAsync(props);
      const franchiseUser = await User.getUserByPhoneOrThrow(phone);
      const method = await Session.getUserMethodOrThrow(
        franchiseUser,
        FranchiseUserMethodProvider.LOCAL
      );

      if (!compareSync(password, method.identity)) {
        throw new InternalError(
          '비밀번호가 일치하지 않습니다.',
          OPCODE.NOT_FOUND
        );
      }

      return franchiseUser;
    } catch (err) {
      throw new InternalError(
        '전화번호 또는 비밀번호가 올바르지 않습니다.',
        OPCODE.NOT_FOUND
      );
    }
  }

  /** 사용자의 새로운 세션을 발행합니다. */
  public static async createSession(
    franchiseUser: FranchiseUserModel,
    userAgent?: string
  ): Promise<string> {
    const franchiseUserSessionId = await Session.generateSessionId();
    const { franchiseUserId } = franchiseUser;
    await prisma.franchiseUserSessionModel.create({
      data: { franchiseUserSessionId, franchiseUserId, userAgent },
    });

    Log.createUserLog(
      franchiseUser,
      FranchiseLogType.LOGIN,
      `${userAgent}에서 로그인을 진행하였습니다.`
    );

    return franchiseUserSessionId;
  }

  /** 모든 로그인 세션을 삭제합니다. */
  public static async revokeAllSession(
    franchiseUser: FranchiseUserModel
  ): Promise<void> {
    const { franchiseUserId } = franchiseUser;
    await prisma.franchiseUserSessionModel.deleteMany({
      where: { franchiseUserId },
    });
  }

  /** 랜덤 세션 ID를 생성합니다. */
  private static async generateSessionId() {
    let franchiseUserSessionId;
    while (true) {
      franchiseUserSessionId = randomBytes(95).toString('base64');
      const session = await prisma.franchiseUserSessionModel.findFirst({
        where: { franchiseUserSessionId },
      });

      if (!session) break;
    }

    return franchiseUserSessionId;
  }

  /** 사용자의 인증 메서드를 가져옵니다. 없을 경우 오류를 발생시킵니다.*/
  public static async getUserMethodOrThrow(
    franchiseUser: FranchiseUserModel,
    provider: FranchiseUserMethodProvider
  ): Promise<FranchiseUserMethodModel> {
    const method = await Session.getUserMethod(franchiseUser, provider);
    if (!method) {
      throw new InternalError('해당 인증 메서드가 없습니다.', OPCODE.NOT_FOUND);
    }

    return method;
  }

  /** 사용자의 인증 메서드를 가져옵니다. */
  public static async getUserMethod(
    franchiseUser: FranchiseUserModel,
    provider: FranchiseUserMethodProvider
  ): Promise<FranchiseUserMethodModel | null> {
    const { franchiseUserId } = franchiseUser;
    const method = await prisma.franchiseUserMethodModel.findFirst({
      where: { franchiseUserId, provider },
    });

    return method;
  }

  /** 세션 ID 로 사용자를 불러옵니다. */
  public static async getUserSession(
    franchiseUserSessionId: string
  ): Promise<
    FranchiseUserSessionModel & {
      franchiseUser: FranchiseUserModel & {
        franchise: FranchiseModel;
        permissionGroup: PermissionGroupModel & {
          permissions: PermissionModel[];
        };
      };
    }
  > {
    const { findFirst } = prisma.franchiseUserSessionModel;
    const session = await findFirst({
      where: { franchiseUserSessionId },
      include: {
        franchiseUser: {
          include: {
            franchise: true,
            permissionGroup: { include: { permissions: true } },
          },
        },
      },
    });

    if (!session) {
      throw new InternalError(
        '로그아웃되었습니다. 다시 로그인해주세요.',
        OPCODE.REQUIRED_LOGIN
      );
    }

    return session;
  }
}
