import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { healthRouter } from './routes/health.js';
import { plansRouter } from './routes/plans.js';
import { serversRouter } from './routes/servers.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '100kb' }));

app.use('/api/health', healthRouter);
app.use('/api/plans', plansRouter);
app.use('/api/servers', serversRouter);

app.use(notFoundHandler);
app.use(errorHandler);
