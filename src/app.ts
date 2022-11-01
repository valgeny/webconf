import express, { NextFunction } from 'express';
import { Application, Request, Response, Router } from 'express';
import type { Server } from 'http';
import { globalErrorHandler, HttpError, httpErrorTransformer } from './errors';
import roomRouter from './routers/roomRouter';
import userRouter from './routers/userRouter';
import participantRouter from './routers/participantRouter';
import hashRouter from './routers/hashRouter';
import { DEFAULT_PORT } from './consts';
import { NO_CONTENT } from 'http-status';
import { connectToDb } from './providers/mssqlProvider';

import { hashEncode } from './services/hashUtils';
var morgan = require('morgan')

export type Handler = (request: Request, response: Response, next?: NextFunction) => Promise<void>;
export const app: Application = express();



export async function startApp(): Promise<Server> {
  // Initialize Providers (Kafka, Database)
  await Promise.all([connectToDb()]);

  app.use([
    express.json(),
    morgan('dev')
  ]);

  // **** Routes **** //
  console.info('Adding routes...');

  // Public Routes
  app.get('/', function (req, res) {
    res.send('Hello World');
  })

  app.get('/health', function (req, res) {
    res.set(NO_CONTENT);
  })


  app.use(
    '/api',
    // APIs
    Router({ mergeParams: true })
      .use('/v0/users', userRouter)
      .use('/v0/rooms', roomRouter)
      .use('/v0/participants', participantRouter)
  );

  app.use(
    '/utils',
    // APIs
    Router({ mergeParams: true })
      .use('/hash', hashRouter)
  );


  // // Swagger UI
  // console.info('Adding documentation...');
  // app.use(
  //   '/docs',
  //   Router({ mergeParams: true })
  //     .use('/api', swaggerUi.serve, swaggerUi.setup(openApiProvider.getSpecs(), { swaggerOptions: { requestSnippetsEnabled: true } }))
  //     .get('/api.json', (_req: Request, res: Response) =>
  //       res.header('Content-Type', 'application/json').send(JSON.stringify(openApiProvider.getSpecs(), undefined, 4)).status(200)
  //     )
  //     .use('/async', express.static(path.resolve(appRoot, 'docs')))
  //     .use('/async.json', express.static(path.resolve(appRoot, 'docs/asyncapi.json')))
  // );

  // 404 Catch all
  app.use('*', (req: Request, _res: Response) => {
    throw new HttpError('Route not found', null, { protocol: req.protocol, host: req.get('host'), originalUrl: req.originalUrl });
  });

  // Post Request Middleware
  app.use([globalErrorHandler, httpErrorTransformer]);

  // Start WebServer
  const server = app.listen({ port: DEFAULT_PORT });
  console.info(`Service started. Waiting for requests on port ${DEFAULT_PORT}.`);

  return server;
}

