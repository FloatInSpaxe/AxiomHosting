import type { ErrorRequestHandler, RequestHandler } from 'express';
import { env } from '../config/env.js';

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({ error: 'Not found' });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);

  response.status(500).json({
    error: 'Internal server error',
    ...(env.nodeEnv === 'development' && error instanceof Error
      ? { message: error.message }
      : {}),
  });
};
