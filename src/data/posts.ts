/* One row of SELECT_POST in postRoutes.ts: the post table plus the ids from its two link tables. */
export interface Post {
  id: number;
  title: string;
  summary: string;
  body: string;
  author_id: number;
  /* pool.ts keeps date columns as text, for example '2026-11-14'. */
  published_on: string;
  /* pg returns timestamptz as a Date; res.json writes it as an ISO string. */
  updated_at: Date;
  category_ids: number[];
  tag_ids: number[];
}
