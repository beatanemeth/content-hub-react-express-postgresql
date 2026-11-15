import type { RequestHandler } from 'express';
import { pool } from '../db/pool.ts';

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
