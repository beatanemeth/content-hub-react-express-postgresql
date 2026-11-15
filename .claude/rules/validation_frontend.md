---
paths:
  - 'frontend/src/components/**'
  - 'frontend/src/pages/**'
---

# Rules: minimal frontend validation

- **Form validation:** Rely primarily on native HTML5 attributes (`required`, `exists`, etc.) rather than external validation libraries (like Zod or React Hook Form) unless specifically requested.

<br>

## Example: creating a post

Here is a minimal implementation example showing how HTML5 validation works together with Native State,
Let the browser handle empty fields or basic rules for the POST / PUT requests:

```Javascript
<form onSubmit={handleSubmit} className="flex flex-col gap-4">
  <input
    type="text"
    name="title"
    placeholder="Post title"
    required // HTML5 browser validation handles empty checks
    className="rounded-xl border p-2"
  />
  <textarea
    name="summary"
    rows={3}
    required
    className="rounded-xl border p-2"
  />
  <textarea
    name="body"
    rows={12}
    required
    className="rounded-xl border p-2"
  />
  <button type="submit" className="bg-black text-white p-2 rounded-xl">Save Post</button>
</form>
```
