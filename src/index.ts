import cors from 'cors';
import express from 'express';
import serverless from 'serverless-http';
import { getRouter, InternalError, LoggerMiddleware, Wrapper } from '.';

export * from './controllers';
export * from './middlewares';
export * from './routes';
export * from './tools';

const app = express();
InternalError.registerSentry(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(LoggerMiddleware());
app.use('/', getRouter());
app.all(
  '*',
  Wrapper(async () => {
    throw new InternalError('Invalid API', 404);
  })
);

const options = { basePath: '/v1/franchise' };
export const handler = serverless(app, options);
