import { FranchiseModel, FranchiseUserModel } from '@prisma/client';
import 'express';
import {
  InternalPlatform,
  InternalPlatformAccessKey,
  InternalPlatformUser,
} from 'openapi-internal-sdk';

declare global {
  namespace Express {
    interface Request {
      franchise: FranchiseModel;
      franchiseUser: FranchiseUserModel;
      loggined: {
        franchise: FranchiseModel;
        franchiseUser: FranchiseUserModel;
      };
      platform: {
        franchise: FranchiseModel;
        platform: InternalPlatform;
        accessKey: InternalPlatformAccessKey;
        user: InternalPlatformUser;
        permissionIds: string[];
      };
      internal: {
        sub: string;
        iss: string;
        aud: string;
        prs: boolean[];
        iat: Date;
        exp: Date;
        franchise: FranchiseModel;
        franchiseUser: FranchiseUserModel;
      };
    }
  }
}
