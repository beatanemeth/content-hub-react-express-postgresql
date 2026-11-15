import express from 'express';

/* The application object: holds the routes (and, later, the middleware); server.ts starts it. */
export const app = express();

/**
 * @desc Answer with a greeting, to check that the server runs
 * @route GET /
 * @success 200, { message: 'Hello from Express' }
 * @errors None
 * @access Public
 */
app.get('/', (_req, res) => {
  res.json({ message: 'Hello from Express' });
});
