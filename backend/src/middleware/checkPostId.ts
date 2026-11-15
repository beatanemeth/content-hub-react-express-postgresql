import type { RequestHandler } from 'express';

/*
 * Runs before every /:id handler. Path parameters are always strings, and PostgreSQL rejects NaN or 1.5
 * for an integer column, so a value that can't be a post id gets a 404 here, before any query.
 * The parsed number goes into res.locals.postId, where the next handler reads it.
 */
export const checkPostId: RequestHandler = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  res.locals.postId = id;
  next();
};
