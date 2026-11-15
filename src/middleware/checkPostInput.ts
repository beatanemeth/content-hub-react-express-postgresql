import type { RequestHandler } from 'express';
import type { PostInput } from '../data/posts.ts';

/* The text form of a PostgreSQL date column, for example '2026-11-14'. */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isId(value: unknown): value is number {
  return Number.isInteger(value);
}

function isIdList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(isId);
}

/*
 * Runs before createPost and updatePost, which take the same body: a body without the PostInput shape gets a 400 here.
 * The checked, trimmed fields go into res.locals.postInput, where the next handler reads them.
 */
export const checkPostInput: RequestHandler = (req, res, next) => {
  /* req.body is typed any; unknown values make TypeScript require the checks below before any use. */
  const requestBody: Record<string, unknown> | undefined = req.body;

  /* req.body is undefined when the request has no JSON body; ?? {} keeps the destructuring safe. */
  const {
    title,
    summary,
    body,
    author_id,
    published_on,
    category_ids,
    tag_ids,
  } = requestBody ?? {};

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

  if (!isId(author_id) || !isIdList(category_ids) || !isIdList(tag_ids)) {
    res.status(400).json({
      error:
        'author_id must be a number; category_ids and tag_ids must be lists of numbers',
    });
    return;
  }

  /* Without this check, a missing or malformed date reaches PostgreSQL and fails there with a 500. */
  if (typeof published_on !== 'string' || !DATE_PATTERN.test(published_on)) {
    res
      .status(400)
      .json({ error: 'published_on must be a date in the form YYYY-MM-DD' });
    return;
  }

  const input: PostInput = {
    title: title.trim(),
    summary: summary.trim(),
    body: body.trim(),
    author_id,
    published_on,
    category_ids,
    tag_ids,
  };
  res.locals.postInput = input;
  next();
};
