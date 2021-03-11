import express, { Application } from 'express';

import { FranchiseMiddleware } from '../middlewares';
import InternalError from '../tools/error';
import InternalMiddleware from '../middlewares/internal';
import OPCODE from '../tools/opcode';
import Wrapper from '../tools/wrapper';
import getAuthRouter from './auth';
import getInternalRouter from './internal';
import getLogsRouter from './logs';
import getPermissionGroupsRouter from './permissionGroups';
import getPermissionRouter from './permissions';
import getUserRouter from './users';
import logger from '../tools/logger';
import morgan from 'morgan';
import os from 'os';

export default function getRouter(): Application {
  const router = express();
  const hostname = os.hostname();
  const logging = morgan('common', {
    stream: { write: (str: string) => logger.info(`${str.trim()}`) },
  });

  router.use(logging);
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));
  router.use('/internal', InternalMiddleware(), getInternalRouter());
  router.use('/logs', FranchiseMiddleware(), getLogsRouter());
  router.use('/users', FranchiseMiddleware(), getUserRouter());
  router.use('/auth', getAuthRouter());
  router.use('/permissions', FranchiseMiddleware(), getPermissionRouter());
  router.use(
    '/permissionGroups',
    FranchiseMiddleware(),
    getPermissionGroupsRouter()
  );

  router.get(
    '/',
    Wrapper(async (_req, res) => {
      res.json({
        opcode: OPCODE.SUCCESS,
        name: process.env.AWS_LAMBDA_FUNCTION_NAME,
        mode: process.env.NODE_ENV,
        cluster: hostname,
      });
    })
  );

  router.all(
    '*',
    Wrapper(async () => {
      throw new InternalError('Invalid API', 404);
    })
  );

  return router;
}
