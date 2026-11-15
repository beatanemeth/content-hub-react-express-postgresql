# API endpoints

The API has one resource: blog posts, under `/api/blog`. The backend runs at `http://localhost:8000`; the frontend runs at `http://localhost:5173` (Vite's default port). The frontend calls relative paths such as `/api/blog`, and the Vite dev server proxies them to the backend. The browser sees one origin, so the API needs no CORS. There is no sign-in; every staff member may create, edit and delete posts (see [NOTES.md](../../NOTES.md)).

**Storage:** the contract below is the same in every phase of the [backend roadmap](./evolution_roadmap_backend.md). The first phase keeps sample posts in an array in a module under `backend/src/data/`, which resets on every server restart. A later phase stores them in PostgreSQL.

<br>

## Post endpoints

| Method   | Path            | Purpose        | Called from                   |
| -------- | --------------- | -------------- | ----------------------------- |
| `GET`    | `/api/blog`     | List all posts | `/blog`                       |
| `GET`    | `/api/blog/:id` | Read one post  | `/blog/:id`, `/blog/:id/edit` |
| `POST`   | `/api/blog`     | Create a post  | Save on `/blog/new`           |
| `PUT`    | `/api/blog/:id` | Replace a post | Save on `/blog/:id/edit`      |
| `DELETE` | `/api/blog/:id` | Delete a post  | Delete on `/blog/:id`         |

<br>

## Contract

It's the agreement between the server and its clients. It says: "If you send this request, you get this response." Error bodies and messages are in [error_handling_backend.md](../../.claude/rules/error_handling_backend.md). The request body of `POST` and `PUT` and the handler code are in [create_post_example.md](./create_post_example.md).

| Action   | Method and path        | Input                                           | Output                   | Success | Failure      |
| -------- | ---------------------- | ----------------------------------------------- | ------------------------ | ------- | ------------ |
| List     | `GET /api/blog`        | None                                            | An array of posts        | `200`   | None         |
| Read one | `GET /api/blog/:id`    | `req.params.id`                                 | One post                 | `200`   | `404`        |
| Create   | `POST /api/blog`       | `req.body`: the post fields                     | The new post with its id | `201`   | `400`        |
| Update   | `PUT /api/blog/:id`    | `req.params.id`; `req.body`: the post fields    | The updated post         | `200`   | `400`, `404` |
| Delete   | `DELETE /api/blog/:id` | `req.params.id`                                 | No body                  | `204`   | `404`        |

- **Post fields:** `title`, `summary`, `body`, `author_id`, `published_on`, `category_ids` and `tag_ids`. They match the `post` table in [mock_schema.sql](./mock_schema.sql); the two id lists come from the link tables `post_category` and `post_tag`. The server sets `id` and `updated_at`.
- **Minutes to read:** every response that returns a post also carries `minutes_to_read`. The server calculates it from `body`; it is not a column, and the client never sends it.
- **Empty list is `200`:** `GET /api/blog` with no posts returns `[]`. The collection exists; it is just empty. `404` would mean the path itself is wrong.
- **`PUT`, not `PATCH`:** `PUT` replaces the whole post, so it takes the same body and the same check as `POST`. `PATCH` would change only the fields sent, which needs merging logic; it can be added later.
- **`req.params.id` is a string:** Express gives every path parameter as a string, so the handler converts it with `Number()`. A non-numeric id such as `/api/blog/abc` matches no post, so it returns `404`.
  - **`Number()` is loose:** it accepts more than plain digits. For example, `/api/blog/1.0` and `/api/blog/0x1` both become `1`, so they find post 1. This is harmless for a local demo. If you want it strict, tighten it later.
