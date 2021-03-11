import { FranchiseModel, FranchiseUserModel } from '@prisma/client';
import 'express';

declare global {
  namespace Express {
    interface Request {
      franchise: FranchiseModel;
      franchiseUser: FranchiseUserModel;
      loggined: {
        franchise: FranchiseModel;
        franchiseUser: FranchiseUserModel;
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
