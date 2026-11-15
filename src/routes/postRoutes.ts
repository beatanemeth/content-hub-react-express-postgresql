import express from 'express';
import { nextPostId, posts, type Post } from '../data/posts.ts';

/* Paths here are relative to where app.ts mounts the router (/api/blog). */
export const postRouter = express.Router();

function isIdList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => Number.isInteger(item));
}

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

/**
 * @desc Create a post
 * @route POST /api/blog
 * @success 201, the new post
 * @errors 400 'Title, summary and body must be non-empty strings'
 * @errors 400 'author_id must be a number; category_ids and tag_ids must be lists of numbers'
 * @access Public
 */
postRouter.post('/', (req, res) => {
  /* req.body is undefined when the request has no JSON body; ?? {} keeps the destructuring safe. */
  const {
    title,
    summary,
    body,
    author_id,
    published_on,
    category_ids,
    tag_ids,
  } = req.body ?? {};

  if (
    typeof title !== 'string' ||
    title.trim() === '' ||
    typeof summary !== 'string' ||
    summary.trim() === '' ||
    typeof body !== 'string' ||
    body.trim() === ''
  ) {
    res
      .status(400)
      .json({ error: 'Title, summary and body must be non-empty strings' });
    return;
  }

  if (
    !Number.isInteger(author_id) ||
    !isIdList(category_ids) ||
    !isIdList(tag_ids)
  ) {
    res.status(400).json({
      error:
        'author_id must be a number; category_ids and tag_ids must be lists of numbers',
    });
    return;
  }

  const post: Post = {
    id: nextPostId(),
    title: title.trim(),
    summary: summary.trim(),
    body: body.trim(),
    author_id,
    published_on,
    updated_at: new Date().toISOString(),
    category_ids,
    tag_ids,
  };
  posts.push(post);

  res.status(201).json(post);
});
