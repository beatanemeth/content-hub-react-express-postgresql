import express from 'express';
import pg from 'pg';
import {
  createPost,
  deletePost,
  findPostBodyError,
  getAllPosts,
  getPostById,
  SELECT_POST,
  withMinutesToRead,
} from '../controllers/postController.ts';
import { type Post } from '../data/posts.ts';
import { pool } from '../db/pool.ts';

/* Paths here are relative to where app.ts mounts the router (/api/blog). */
export const postRouter = express.Router();

postRouter.get('/', getAllPosts);

postRouter.get('/:id', getPostById);

postRouter.post('/', createPost);

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
