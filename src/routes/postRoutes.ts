import express from 'express';
import pg from 'pg';
import {
  deletePost,
  getPostById,
  SELECT_POST,
  withMinutesToRead,
} from '../controllers/postController.ts';
import { type Post } from '../data/posts.ts';
import { pool } from '../db/pool.ts';

/* The text form of a PostgreSQL date column, for example '2026-11-14'. */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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
  const {
    title,
    summary,
    body,
    author_id,
    published_on,
    category_ids,
    tag_ids,
  } = requestBody ?? {};

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

  /* Without this check, a missing or malformed date reaches PostgreSQL and fails there with a 500. */
  if (typeof published_on !== 'string' || !DATE_PATTERN.test(published_on)) {
    return 'published_on must be a date in the form YYYY-MM-DD';
  }

  return null;
}

/**
 * @desc List all posts
 * @route GET /api/blog
 * @success 200, an array of posts ([] when there are none)
 * @errors 500 'Internal Server Error'
 * @access Public
 */
postRouter.get('/', async (_req, res) => {
  try {
    const result = await pool.query<Post>(`${SELECT_POST} ORDER BY p.id`);

    res.json(result.rows.map(withMinutesToRead));
  } catch (error) {
    /* The details stay in the server log; the client gets only the generic message. */
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

postRouter.get('/:id', getPostById);

/**
 * @desc Create a post
 * @route POST /api/blog
 * @success 201, the new post
 * @errors 400 'Title, summary and body must be non-empty strings'
 * @errors 400 'author_id must be a number; category_ids and tag_ids must be lists of numbers'
 * @errors 400 'published_on must be a date in the form YYYY-MM-DD'
 * @errors 400 'Author, category or tag does not exist'
 * @errors 500 'Internal Server Error'
 * @access Public
 */
postRouter.post('/', async (req, res) => {
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

  /* BEGIN and COMMIT must run on the same connection; pool.query() may pick a different one for each call. */
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    /* RETURNING id gives back the id PostgreSQL just created, so the link rows can use it. */
    const inserted = await client.query<{ id: number }>(
      `INSERT INTO post (title, summary, body, author_id, published_on, updated_at)
       VALUES ($1, $2, $3, $4, $5, now())
       RETURNING id`,
      [title.trim(), summary.trim(), body.trim(), author_id, published_on],
    );
    const postId = inserted.rows[0].id;

    for (const categoryId of category_ids) {
      await client.query(
        'INSERT INTO post_category (post_id, category_id) VALUES ($1, $2)',
        [postId, categoryId],
      );
    }
    for (const tagId of tag_ids) {
      await client.query(
        'INSERT INTO post_tag (post_id, tag_id) VALUES ($1, $2)',
        [postId, tagId],
      );
    }

    await client.query('COMMIT');

    const result = await client.query<Post>(`${SELECT_POST} WHERE p.id = $1`, [
      postId,
    ]);
    res.status(201).json(withMinutesToRead(result.rows[0]));
  } catch (error) {
    /* Undo every insert of this request. */
    await client.query('ROLLBACK');

    /* 23503 = foreign key violation: an author, category or tag id does not exist. */
    if (error instanceof pg.DatabaseError && error.code === '23503') {
      res.status(400).json({ error: 'Author, category or tag does not exist' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } finally {
    /* Runs after success and after an error: without it, the pool runs out of connections. */
    client.release();
  }
});

/**
 * @desc Replace a post
 * @route PUT /api/blog/:id
 * @success 200, the updated post
 * @errors 400 'Title, summary and body must be non-empty strings'
 * @errors 400 'author_id must be a number; category_ids and tag_ids must be lists of numbers'
 * @errors 400 'published_on must be a date in the form YYYY-MM-DD'
 * @errors 400 'Author, category or tag does not exist'
 * @errors 404 'Post not found'
 * @errors 500 'Internal Server Error'
 * @access Public
 */
postRouter.put('/:id', async (req, res) => {
  const error = findPostBodyError(req.body);

  if (error) {
    res.status(400).json({ error });
    return;
  }

  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
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

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    /* PUT replaces the whole post: the id stays, every other column comes from the body. */
    const updated = await client.query(
      `UPDATE post
       SET title = $1, summary = $2, body = $3, author_id = $4, published_on = $5, updated_at = now()
       WHERE id = $6`,
      [title.trim(), summary.trim(), body.trim(), author_id, published_on, id],
    );

    /* rowCount is the number of rows the UPDATE changed: 0 means no post has this id. */
    if (updated.rowCount === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    /* Replace the link rows: delete the old ones, then insert the ids from the body. */
    await client.query('DELETE FROM post_category WHERE post_id = $1', [id]);
    await client.query('DELETE FROM post_tag WHERE post_id = $1', [id]);

    for (const categoryId of category_ids) {
      await client.query(
        'INSERT INTO post_category (post_id, category_id) VALUES ($1, $2)',
        [id, categoryId],
      );
    }
    for (const tagId of tag_ids) {
      await client.query(
        'INSERT INTO post_tag (post_id, tag_id) VALUES ($1, $2)',
        [id, tagId],
      );
    }

    await client.query('COMMIT');

    const result = await client.query<Post>(`${SELECT_POST} WHERE p.id = $1`, [
      id,
    ]);
    res.json(withMinutesToRead(result.rows[0]));
  } catch (error) {
    await client.query('ROLLBACK');

    /* 23503 = foreign key violation: an author, category or tag id does not exist. */
    if (error instanceof pg.DatabaseError && error.code === '23503') {
      res.status(400).json({ error: 'Author, category or tag does not exist' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } finally {
    client.release();
  }
});

postRouter.delete('/:id', deletePost);
