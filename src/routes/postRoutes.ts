import express from 'express';
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  updatePost,
} from '../controllers/postController.ts';
import { checkPostId } from '../middleware/checkPostId.ts';

/*
 * Paths here are relative to where app.ts mounts the router (/api/blog).
 * The functions after a path run left to right; each one either calls next() or ends the request.
 */
export const postRouter = express.Router();

postRouter.get('/', getAllPosts);

postRouter.get('/:id', checkPostId, getPostById);

postRouter.post('/', createPost);

postRouter.put('/:id', checkPostId, updatePost);

postRouter.delete('/:id', checkPostId, deletePost);
