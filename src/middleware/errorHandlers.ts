import type { RequestHandler } from 'express';

/*
 * Registered after every router: a request reaches it only when no route matched its method and path.
 * Without it, Express answers with its default HTML page "Cannot GET /...".
 */
export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
};
