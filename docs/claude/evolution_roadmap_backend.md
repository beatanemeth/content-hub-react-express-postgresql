# Backend evolution roadmap (phased approach)

This guide outlines the step-by-step evolution of the Express and TypeScript backend for our study project. By starting simple and scaling architecture progressively, we avoid premature complexity while learning professional backend patterns.

<br>

## Phase 1: in-memory storage and single-file routes

**Goal:** Establish the HTTP request-response cycle instantly with zero database overhead.

- **Storage:** Synchronous JavaScript arrays.
- **Error handling:** Local `res.status(400).json(...)` validation responses directly inside the route file.

### Example code (`src/routes/postRoutes.ts`)

```typescript
import express from 'express';
import { nextPostId, posts, type Post } from '../data/posts.ts';

export const postRouter = express.Router();

postRouter.get('/', (_req, res) => {
  res.json(posts);
});

postRouter.post('/', (req, res) => {
  const { title, summary, body } = req.body ?? {};

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

  // Shortened: the full handler (author, date, category and tag ids) is in create_post_example.md.
  const post: Post = {
    id: nextPostId(),
    title: title.trim(),
    summary: summary.trim(),
    body: body.trim(),
  };
  posts.push(post);

  res.status(201).json(post);
});
```

<br>

## Phase 2: PostgreSQL integration and async/await

**Goal:** Connect a real database, shifting from synchronous memory checks to asynchronous queries.

- **Storage:** PostgreSQL database via `pg` pool connection.
- **Key shift:** All route handlers become `async`, wrapping queries in `try/catch`.
- **In-memory data removed:** once every handler uses SQL, the sample posts array and `nextPostId` are deleted; `src/data/posts.ts` keeps only the `Post` interface.

### Example code (`src/routes/postRoutes.ts`)

```typescript
import express from 'express';
import { pool } from '../db/database.ts';

export const postRouter = express.Router();

postRouter.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM post ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error while fetching posts' });
  }
});
```

<br>

## Phase 3: splitting routes and controllers

**Goal:** Separate URL mapping from business logic to keep code clean and readable as queries grow.

- **`routes/`:** Define endpoints and attach middleware/controllers.
- **`controllers/`:** Handle business rules, request validation, and database queries.

### Example code

```typescript
// 1. Controller (src/controllers/postController.ts)
import { Request, Response } from 'express';
import { pool } from '../db/database.ts';

export async function getPosts(_req: Request, res: Response) {
  const result = await pool.query('SELECT * FROM post ORDER BY id ASC');
  res.json(result.rows);
}

// 2. Router (src/routes/postRoutes.ts)
import express from 'express';
import { getPosts } from '../controllers/postController.ts';

export const postRouter = express.Router();
postRouter.get('/', getPosts);
```

<br>

## Phase 4: centralised error-handling middleware

**Goal:** Eliminate repetitive `res.status(500).json(...)` blocks in every controller by leveraging Express's error-forwarding pipeline (`next(err)`).

1. **Error handlers (`src/middleware/errorHandlers.ts`):**

```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
}
```

2. **Controller integration (`next(err)`):**

```typescript
export async function getPosts(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await pool.query('SELECT * FROM post ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    next(err); // Hands error directly to errorHandler middleware
  }
}
```

<br>

## Phase 5: custom operational middleware

**Goal:** Add lightweight utility middlewares (such as request loggers or custom input sanity checks) to handle cross-cutting concerns cleanly.

### Example code (`src/middleware/requestLogger.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';

export function requestLogger(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}
```
