import type { ErrorRequestHandler, RequestHandler } from 'express';

/*
 * Registered after every router: a request reaches it only when no route matched its method and path.
 * Without it, Express answers with its default HTML page "Cannot GET /...".
 */
export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
};

/*
 * Receives every error passed to next(err), thrown, or rejected by an async handler (Express 5).
 * Express treats it as an error handler only because it has four parameters, so _next must stay.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  /* express.json() marks a body it cannot parse with this type. */
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  /* The details stay in the server log; the client gets only the generic message. */
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
};
