// A relative path: the Vite proxy forwards /api requests to the backend
const BASE_URL = '/api/blog';

const NETWORK_ERROR =
  'Cannot reach the server. Check that the backend is running.';

/* Every error the API sends has this body, for example { "error": "Post not found" }. */
interface ApiError {
  error: string;
}

/* One post as GET /api/blog and GET /api/blog/:id return it. */
export interface Post {
  id: number;
  title: string;
  summary: string;
  body: string;
  author_id: number;
  /* The API sends dates as text, for example '2026-06-01'. */
  published_on: string;
  updated_at: string;
  category_ids: number[];
  tag_ids: number[];
  /* Calculated by the API from body; never sent back. */
  minutes_to_read: number;
}

/* The body of POST and PUT: the post fields the user enters; the server sets the rest. */
export interface PostInput {
  title: string;
  summary: string;
  body: string;
  author_id: number;
  published_on: string;
  category_ids: number[];
  tag_ids: number[];
}

// Both POST and PUT send the post fields as JSON
function jsonOptions(method: string, input: PostInput): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  };
}

// Sends the request; turns "no answer" into one clear message
async function request(url: string, options?: RequestInit): Promise<Response> {
  let response: Response;

  try {
    response = await fetch(url, options);
  } catch {
    // fetch throws (a TypeError) only when no answer arrives: Vite stopped or the network is down
    throw new Error(NETWORK_ERROR);
  }

  // The Vite proxy answers 502 with an empty body when Express is not running
  if (response.status === 502) {
    throw new Error(NETWORK_ERROR);
  }

  return response;
}

// A 4xx or 5xx answer still resolves fetch, so the caller checks response.ok and throws this
async function readError(response: Response): Promise<Error> {
  const body: ApiError = await response.json();

  return new Error(body.error);
}

export async function getPosts(): Promise<Post[]> {
  const response = await request(BASE_URL);

  if (!response.ok) {
    throw await readError(response);
  }

  return response.json();
}

// null for an unknown id, so the page can show its not-found state instead of an error
export async function getPost(id: number): Promise<Post | null> {
  const response = await request(`${BASE_URL}/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw await readError(response);
  }

  return response.json();
}

// The API answers 201 Created with the new post, which carries its new id
export async function createPost(input: PostInput): Promise<Post> {
  const response = await request(BASE_URL, jsonOptions('POST', input));

  if (!response.ok) {
    throw await readError(response);
  }

  return response.json();
}

export async function updatePost(id: number, input: PostInput): Promise<Post> {
  const response = await request(
    `${BASE_URL}/${id}`,
    jsonOptions('PUT', input),
  );

  if (!response.ok) {
    throw await readError(response);
  }

  return response.json();
}

// The API answers 204 No Content, so there is nothing to return
export async function deletePost(id: number): Promise<void> {
  const response = await request(`${BASE_URL}/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    throw await readError(response);
  }
}
