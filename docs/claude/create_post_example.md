# Create a post: example

Reference for the `POST /api/blog` handler: first with in-memory storage (Phase 1), then with PostgreSQL (Phase 2) of the [backend roadmap](./evolution_roadmap_backend.md). The endpoint contract is in [api_endpoints.md](./api_endpoints.md).

<br>

## Decisions

- **The client sends ids, not names or labels:** the dropdown shows staff names and sends `author_id`. The checkboxes send `category_ids` and `tag_ids`. The code has no name-to-id lookup.
- **Categories and tags are fixed lists:** they are seeded in the database. A post can link only to existing ones; the API never creates them.
- **Form lists are hard-coded in the first frontend phase:** the staff, category and tag lists live in `frontend/src/data/` until the pages are connected to the API.
- **JSON names are snake_case:** they match the database columns and `mock_data.js`, so `pg` rows need no renaming.
- **The response is the post itself:** it has no `message` and no debug fields.

<br>

## Request body

`POST /api/blog` and `PUT /api/blog/:id` take the same body. In `blog.http`, the ids are plain numbers from the seed data.

```json
{
  "title": "My Coffee Journey",
  "summary": "Exploring unique brews",
  "body": "Content here...",
  "author_id": 1,
  "published_on": "2026-11-14",
  "category_ids": [1, 2],
  "tag_ids": [1]
}
```

The server sets `id` and `updated_at`. The client never sends them.

<br>

## Phase 1: in-memory storage

There are no junction tables in memory. The id arrays live inside the post, which matches the shape of the API.

### `backend/src/data/posts.ts`

```typescript
export interface Post {
  id: number;
  title: string;
  summary: string;
  body: string;
  author_id: number;
  published_on: string;
  updated_at: string;
  category_ids: number[];
  tag_ids: number[];
}

export const posts: Post[] = [];

let lastId = 0;

// A counter, not "last id + 1": an id is never reused after a delete.
export function nextPostId(): number {
  lastId += 1;
  return lastId;
}
```

### `backend/src/routes/postRoutes.ts`

```typescript
import express from 'express';
import { nextPostId, posts, type Post } from '../data/posts.ts';

export const postRouter = express.Router();

function isIdList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => Number.isInteger(item));
}

/**
 * @desc Create a post
 * @route POST /api/blog
 * @success 201, the new post
 * @errors 400 'Title, summary and body must be non-empty strings'
 * @errors 400 'author_id must be a number; category_ids and tag_ids must be lists of numbers'
 * @access Public
 */
postRouter.post('/', (req, res) => {
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
```

- **Early return:** both checks answer `400` at the top of the handler, as in [validation_backend.md](../../.claude/rules/validation_backend.md).
- **No id existence check:** the in-memory phase trusts the ids. The database checks them in Phase 2.

<br>

## Phase 2: PostgreSQL

A post and its link rows go into three tables. They must succeed or fail together, so the handler uses one transaction on one client from the pool.

```typescript
import express from 'express';
import { pool } from '../db/database.ts';

export const postRouter = express.Router();

// 23503 = foreign key violation: an author, category or tag id does not exist.
const PG_ERROR_STATUS: Record<string, number> = { '23503': 400 };

postRouter.post('/', async (req, res) => {
  // The same body validation as in Phase 1.

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO post (title, summary, body, author_id, published_on, updated_at)
			 VALUES ($1, $2, $3, $4, $5, NOW())
			 RETURNING id`,
      [title, summary, body, author_id, published_on],
    );
    const postId = rows[0].id;

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

    // Read the post back with its category and tag ids, then send it with 201.
  } catch (err) {
    await client.query('ROLLBACK');

    const code = (err as { code?: string }).code ?? '';
    const status = PG_ERROR_STATUS[code] ?? 500;
    const error =
      status === 400
        ? 'Author, category or tag does not exist'
        : 'Internal Server Error';
    res.status(status).json({ error });
  } finally {
    client.release();
  }
});
```

- **`pool.connect()`:** `BEGIN` and `COMMIT` must run on the same connection. `pool.query()` may use a different connection for each call.
- **`finally`:** the client returns to the pool after success and after an error. Without it, the pool runs out of connections.
- **No id checks in the handler:** the foreign keys reject unknown ids with error code `23503`, which `PG_ERROR_STATUS` maps to `400`.
- **`NOW()`:** the database sets `updated_at`. `PUT` must set it again on every update.
