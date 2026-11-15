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

/* Sample posts from docs/claude/mock_data.js. The array lives in memory, so it resets on every server restart. */
export const posts: Post[] = [
  {
    id: 1,
    title: 'From a Borrowed Kitchen to a Roastery',
    summary:
      'How a weekend pop-up run by seven people grew into our own roastery and café.',
    body: 'We began as a weekend pop-up in a borrowed community kitchen. Seven of us roasted, brewed and poured for whoever walked in.\n\nTwo years later we moved into our own roastery with a café. The kitchen taught us the lesson we still repeat: good coffee takes patience, and it tastes better shared.',
    author_id: 1,
    published_on: '2026-06-01',
    updated_at: '2026-06-01T10:00:00Z',
    category_ids: [1],
    tag_ids: [2, 6],
  },
  {
    id: 2,
    title: 'What We Tasted on Cupping Day',
    summary:
      'A guest host explains why we slurp, swirl and compare coffees side by side.',
    body: 'Cupping looks odd at first: a row of small bowls, a spoon and a lot of slurping. It is the fairest way to compare coffees, because every bowl gets the same grind, water and time.\n\nOn Cupping Day, our guests tasted, wrote down what they found and argued kindly about it. That conversation is the point.',
    author_id: 2,
    published_on: '2026-06-02',
    updated_at: '2026-06-02T14:30:00Z',
    category_ids: [3, 4],
    tag_ids: [4, 5],
  },
  {
    id: 3,
    title: 'Espresso at Pedal Speed',
    summary:
      'A guest post from the bicycle espresso cart that brings the bar to the street.',
    body: 'Forward Coffee is a cart, a bicycle and a small espresso machine. Every cup starts the same way: a greeting, a question and a minute of waiting.\n\nHospitality is the part that does not fit in a recipe. People remember how a cup was handed to them.',
    author_id: 3,
    published_on: '2026-06-05',
    updated_at: '2026-06-05T09:15:00Z',
    category_ids: [4, 2],
    tag_ids: [3, 1],
  },
];

/* The sample ids run from 1 to posts.length, so the counter starts there. */
let lastId = posts.length;

/* A counter, not "last id + 1": an id is never reused after a delete. */
export function nextPostId(): number {
  lastId += 1;
  return lastId;
}
