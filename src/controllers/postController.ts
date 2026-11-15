import type { RequestHandler } from 'express';
import pg from 'pg';
import { type Post } from '../data/posts.ts';
import { pool } from '../db/pool.ts';

/* An average adult reading speed for plain text. */
const WORDS_PER_MINUTE = 200;

/* The text form of a PostgreSQL date column, for example '2026-11-14'. */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/*
 * The columns of one post, shared by the handlers that return posts; each adds its own WHERE or ORDER BY.
 * ARRAY(subquery) collects a post's link rows into one list, and gives {} (not NULL) when there are none.
 */
const SELECT_POST = `
  SELECT p.id, p.title, p.summary, p.body, p.author_id, p.published_on, p.updated_at,
    ARRAY(SELECT category_id FROM post_category WHERE post_id = p.id ORDER BY category_id) AS category_ids,
    ARRAY(SELECT tag_id FROM post_tag WHERE post_id = p.id ORDER BY tag_id) AS tag_ids
  FROM post AS p
`;

/* The shape every response sends: the stored post plus a value calculated on each request. */
interface PostResponse extends Post {
  minutes_to_read: number;
}

/* Not stored: calculating it from body keeps it correct after every PUT. */
function withMinutesToRead(post: Post): PostResponse {
  const wordCount = post.body.split(/\s+/).length;

  return {
    ...post,
    minutes_to_read: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
  };
}

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
export const getAllPosts: RequestHandler = async (_req, res) => {
  /* No try/catch: if the query fails, Express 5 passes the rejected promise to errorHandler (500). */
  const result = await pool.query<Post>(`${SELECT_POST} ORDER BY p.id`);

  res.json(result.rows.map(withMinutesToRead));
};

/**
 * @desc Get one post
 * @route GET /api/blog/:id
 * @success 200, the post
 * @errors 404 'Post not found'
 * @errors 500 'Internal Server Error'
 * @access Public
 */
export const getPostById: RequestHandler = async (req, res) => {
  /* Path parameters are always strings. PostgreSQL rejects NaN or 1.5 for an integer column, so answer 404 before the query. */
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  /* $1 is a placeholder: pg sends id separately from the SQL text, so the value can never change the query. */
  const result = await pool.query<Post>(`${SELECT_POST} WHERE p.id = $1`, [id]);
  const post = result.rows[0];

  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  res.json(withMinutesToRead(post));
};

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
export const createPost: RequestHandler = async (req, res) => {
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
      return;
    }

    /* Any other error goes on to errorHandler (500); finally still runs first and releases the client. */
    throw error;
  } finally {
    /* Runs after success and after an error: without it, the pool runs out of connections. */
    client.release();
  }
};

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
export const updatePost: RequestHandler = async (req, res) => {
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

    if (error instanceof pg.DatabaseError && error.code === '23503') {
      res.status(400).json({ error: 'Author, category or tag does not exist' });
      return;
    }

    throw error;
  } finally {
    client.release();
  }
};

/**
 * @desc Delete a post
 * @route DELETE /api/blog/:id
 * @success 204, no body
 * @errors 404 'Post not found'
 * @errors 500 'Internal Server Error'
 * @access Public
 */
export const deletePost: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  /* One statement, so no transaction: ON DELETE CASCADE in the schema removes the link rows too. */
  const result = await pool.query('DELETE FROM post WHERE id = $1', [id]);

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  /* 204 No Content: success with no body, so end() instead of json(). */
  res.status(204).end();
};
