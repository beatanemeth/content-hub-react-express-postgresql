import express from 'express';
import { posts } from '../data/posts.ts';

/* Paths here are relative to where app.ts mounts the router (/api/blog). */
export const postRouter = express.Router();

/**
 * @desc List all posts
 * @route GET /api/blog
 * @success 200, an array of posts ([] when there are none)
 * @errors None
 * @access Public
 */
postRouter.get('/', (_req, res) => {
  res.json(posts);
});
