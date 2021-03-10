import dotenv from 'dotenv';
import getRouter from './routes';
import serverless from 'serverless-http';
if (process.env.NODE_ENV === 'dev') dotenv.config();

const options = { basePath: '/v1/franchise' };
export const handler = serverless(getRouter(), options);
