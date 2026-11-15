---
paths:
  - 'backend/**'
  - 'src/routes/**'
  - 'src/controllers/**'
---

# Rules: minimal error handling in the backend

**Phase:** `notFoundHandler` and `errorHandler` arrive in Phase 4 of the [backend roadmap](../../docs/claude/evolution_roadmap_backend.md). Until then, Express answers unknown routes and broken JSON with its default HTML page.

- **Explicit HTTP status codes:** Always return appropriate status codes (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
- **Plain JSON error messages:** Return errors as a simple JSON object containing an `error` key. No heavy error-handling frameworks or complex error classification classes.

<br>

## Example: handling a missing resource or invalid request

- **Error body:** every failure returns the same shape, so a client reads errors in one way:

```typescript
// In an Express controller or route
const post = posts.find((item) => item.id === id);

if (!post) {
	res.status(404).json({ error: 'Post not found' });
	return;
}
```

<br>

## Three places send errors

- **Route handlers:** send their own errors, for example `res.status(404).json({ error: 'Post not found' })`.
- **`notFoundHandler`:** runs after all routers, only when no route matched. It returns `404 { "error": "Route not found" }`.
- **`errorHandler`:** the four-parameter middleware at the end of the app. It answers the errors that no handler answered: broken JSON (`400`) and unexpected errors (`500`).

Any route can also return these errors, so the contract table does not repeat them:

| Status | Body                                   | When                                                            |
| ------ | -------------------------------------- | --------------------------------------------------------------- |
| `400`  | `{ "error": "Invalid JSON body" }`     | The request body is not valid JSON.                             |
| `404`  | `{ "error": "Route not found" }`       | No route matches the method and path.                           |
| `500`  | `{ "error": "Internal Server Error" }` | An unexpected error. The details are logged on the server only. |

- **Later change:** handlers will `throw new HttpError(404, 'Post not found')` instead, and `errorHandler` will write every error body. Then only one place builds the error shape, like FastAPI's `raise HTTPException(404)`.
