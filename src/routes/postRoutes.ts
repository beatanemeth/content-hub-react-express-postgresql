import express from 'express';
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  updatePost,
} from '../controllers/postController.ts';

/* Paths here are relative to where app.ts mounts the router (/api/blog). */
export const postRouter = express.Router();

postRouter.get('/', getAllPosts);

postRouter.get('/:id', getPostById);

postRouter.post('/', createPost);

postRouter.put('/:id', updatePost);

postRouter.delete('/:id', deletePost);
