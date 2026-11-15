import express from 'express';
import { errorHandler, notFoundHandler } from './middleware/errorHandlers.ts';
import { postRouter } from './routes/postRoutes.ts';

/* The application object: holds the routes (and, later, the middleware); server.ts starts it. */
export const app = express();

/* Middleware runs in registration order, so the body is parsed before any route reads req.body. */
app.use(express.json());

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

/*
 * Sends every request under /api/blog, whatever its method, to postRouter.
 * Express removes the prefix, so the router matches only the rest of the path ('/' or '/:id') and the method.
 */
app.use('/api/blog', postRouter);

/* After all routes: reached only when no route above sent a response. */
app.use(notFoundHandler);

/* Registered last, so it catches errors from everything above. */
app.use(errorHandler);
