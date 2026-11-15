import type { RequestHandler } from 'express';
import type { PostInput } from '../data/posts.ts';

/*
 * True for a real calendar date in YYYY-MM-DD, the text form of a PostgreSQL date column.
 * JavaScript rolls 2026-02-30 over to 2026-03-02, so turning the Date back into text and comparing catches it.
 */
function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const date = new Date(value);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

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

  /* Without this check, a missing or impossible date reaches PostgreSQL and fails there with a 500. */
  if (!isIsoDate(published_on)) {
    res.status(400).json({
      error: 'published_on must be a valid date in the form YYYY-MM-DD',
    });
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
