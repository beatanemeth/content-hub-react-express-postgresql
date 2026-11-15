import type { RequestHandler } from 'express';

/* Logs every request, then hands it on: without next(), the request would wait forever for a response. */
export const requestLogger: RequestHandler = (req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};
