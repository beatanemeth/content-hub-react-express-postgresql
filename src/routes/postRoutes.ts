import express from 'express';
import { nextPostId, posts, type Post } from '../data/posts.ts';

/* Paths here are relative to where app.ts mounts the router (/api/blog). */
export const postRouter = express.Router();

function isIdList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => Number.isInteger(item));
}

/* POST and PUT take the same body, so they share one check. Returns the error message, or null when the body is valid. */
function findPostBodyError(
  requestBody: Record<string, unknown> | undefined,
): string | null {
  /* req.body is undefined when the request has no JSON body; ?? {} keeps the destructuring safe. */
  const { title, summary, body, author_id, category_ids, tag_ids } =
    requestBody ?? {};

  if (
    typeof title !== 'string' ||
    title.trim() === '' ||
    typeof summary !== 'string' ||
    summary.trim() === '' ||
    typeof body !== 'string' ||
    body.trim() === ''
  ) {
    return 'Title, summary and body must be non-empty strings';
  }

  if (
    !Number.isInteger(author_id) ||
    !isIdList(category_ids) ||
    !isIdList(tag_ids)
  ) {
    return 'author_id must be a number; category_ids and tag_ids must be lists of numbers';
  }

  return null;
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
  const error = findPostBodyError(req.body);

  if (error) {
    res.status(400).json({ error });
    return;
  }

  const {
    title,
    summary,
    body,
    author_id,
    published_on,
    category_ids,
    tag_ids,
  } = req.body;

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

/**
 * @desc Replace a post
 * @route PUT /api/blog/:id
 * @success 200, the updated post
 * @errors 400 'Title, summary and body must be non-empty strings'
 * @errors 400 'author_id must be a number; category_ids and tag_ids must be lists of numbers'
 * @errors 404 'Post not found'
 * @access Public
 */
postRouter.put('/:id', (req, res) => {
  const error = findPostBodyError(req.body);

  if (error) {
    res.status(400).json({ error });
    return;
  }

  const id = Number(req.params.id);
  /* findIndex, not find: the handler replaces the element at this position. */
  const index = posts.findIndex((item) => item.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const {
    title,
    summary,
    body,
    author_id,
    published_on,
    category_ids,
    tag_ids,
  } = req.body;

  /* PUT replaces the whole post: the id stays, every other field comes from the body. */
  const post: Post = {
    id,
    title: title.trim(),
    summary: summary.trim(),
    body: body.trim(),
    author_id,
    published_on,
    updated_at: new Date().toISOString(),
    category_ids,
    tag_ids,
  };
  posts[index] = post;

  res.json(post);
});

/**
 * @desc Delete a post
 * @route DELETE /api/blog/:id
 * @success 204, no body
 * @errors 404 'Post not found'
 * @access Public
 */
postRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = posts.findIndex((item) => item.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  /* splice removes one element at this position and changes the array in place. */
  posts.splice(index, 1);

  /* 204 No Content: success with no body, so end() instead of json(). */
  res.status(204).end();
});
