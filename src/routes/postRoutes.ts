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

/**
 * @desc Get one post
 * @route GET /api/blog/:id
 * @success 200, the post
 * @errors 404 'Post not found'
 * @access Public
 */
postRouter.get('/:id', (req, res) => {
  /* Path parameters are always strings; a non-numeric id becomes NaN and matches no post. */
  const id = Number(req.params.id);
  const post = posts.find((item) => item.id === id);

  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  res.json(post);
});
