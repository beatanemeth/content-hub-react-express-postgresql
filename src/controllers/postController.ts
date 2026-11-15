import type { RequestHandler } from 'express';
import { type Post } from '../data/posts.ts';
import { pool } from '../db/pool.ts';

/* An average adult reading speed for plain text. */
const WORDS_PER_MINUTE = 200;

/*
 * The columns of one post, shared by the handlers that return posts; each adds its own WHERE or ORDER BY.
 * ARRAY(subquery) collects a post's link rows into one list, and gives {} (not NULL) when there are none.
 */
export const SELECT_POST = `
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
export function withMinutesToRead(post: Post): PostResponse {
  const wordCount = post.body.split(/\s+/).length;

  return {
    ...post,
    minutes_to_read: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
  };
}

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

  try {
    /* $1 is a placeholder: pg sends id separately from the SQL text, so the value can never change the query. */
    const result = await pool.query<Post>(`${SELECT_POST} WHERE p.id = $1`, [
      id,
    ]);
    const post = result.rows[0];

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json(withMinutesToRead(post));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
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

  try {
    /* One statement, so no transaction: ON DELETE CASCADE in the schema removes the link rows too. */
    const result = await pool.query('DELETE FROM post WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    /* 204 No Content: success with no body, so end() instead of json(). */
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
