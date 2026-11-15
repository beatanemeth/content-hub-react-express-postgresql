---
paths:
  - 'frontend/src/components/**'
  - 'frontend/src/pages/**'
  - 'frontend/src/api/**'
---

# Rules: minimal error handling in the API layer and UI

**Phase:** Phase 1 has no API calls. API functions start throwing errors in Phase 2 of the [frontend roadmap](../../docs/claude/evolution_roadmap_frontend.md), and pages display them from Phase 3.

- **Error display:** Catch errors in page/form components and display them as simple plain-text messages or inline text banners. No custom error toast managers or complex error components.

<br>

## Example: creating a post

Here is a complete, minimal implementation of the API helper and a React form component showing how `try/catch` and plain-text error handling work together.

1. The **API function** (`src/api/posts.ts`)

This function sends the **POST** request, _validates_ _response.ok_, and _throws_ a clean error if the server rejects it.

```TypeScript
// A relative path: the Vite proxy forwards /api requests to the backend.
const baseURL = "/api/blog";

// Shortened: the full request body is in docs/claude/create_post_example.md.
export async function createPost(newPost: { title: string; summary: string; body: string }) {
    const response = await fetch(baseURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
    });

    if (!response.ok) {
        throw new Error(`Failed to save post (Server returned ${response.status})`);
    }

    return response.json();
}
```

2. The **Form component** (`src/components/PostForm.tsx`)

This component uses native HTML5 required attributes for basic validation, catches any errors thrown by the API, and renders the message as a simple plain-text warning.

```TypeScript
import { useState, FormEvent } from "react";
import { createPost } from "../api/posts";

export default function PostForm() {
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [body, setBody] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null); // Clear previous errors on a new submit attempt

        try {
            await createPost({ title, summary, body });

            // Clear form on success
            setTitle("");
            setSummary("");
            setBody("");
            alert("Post created successfully!");
        } catch (err: any) {
            // Capture the error message and display it as plain text
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md p-6 border rounded-xl">
            <h2 className="text-xl font-bold">New Post</h2>

            {/* Minimal plain-text error banner */}
            {error && (
                <p className="p-3 text-red-600 bg-red-50 rounded-lg text-sm border border-red-200">
                    {error}
                </p>
            )}

            <input
                type="text"
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="border rounded-lg p-2"
            />

            <textarea
                placeholder="Summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                className="border rounded-lg p-2"
            />

            <textarea
                placeholder="Body text"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                className="border rounded-lg p-2 h-32"
            />

            <button type="submit" className="bg-black text-white p-2 rounded-lg font-medium hover:bg-gray-800">
                Create Post
            </button>
        </form>
    );
}
```
