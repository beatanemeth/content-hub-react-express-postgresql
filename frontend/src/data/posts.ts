// Placeholder data until the pages call the API; src/api/posts.ts replaces this file.

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

export interface Person {
  id: number;
  full_name: string;
}

export interface Category {
  id: number;
  label: string;
}

export interface Tag {
  id: number;
  label: string;
}

// A post holds only ids; these lists give the names and labels to show.
export const STAFF: Person[] = [
  { id: 1, full_name: 'Martha Lindley' },
  { id: 2, full_name: 'Dr. Iris Carter' },
  { id: 3, full_name: 'Nora Hall' },
  { id: 4, full_name: 'Rose Dalton' },
  { id: 5, full_name: 'Daniel Brooks' },
  { id: 6, full_name: 'Leah Bradley' },
];

export const CATEGORIES: Category[] = [
  { id: 1, label: 'CafeStories' },
  { id: 2, label: 'BrewingTips' },
  { id: 3, label: 'EventReports' },
  { id: 4, label: 'GuestPosts' },
];

export const TAGS: Tag[] = [
  { id: 1, label: 'Ritual' },
  { id: 2, label: 'Patience' },
  { id: 3, label: 'Hospitality' },
  { id: 4, label: 'Learning' },
  { id: 5, label: 'Cupping' },
  { id: 6, label: 'Community' },
];

// The body separates paragraphs with a blank line ("\n\n").
export const POSTS: Post[] = [
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
    minutes_to_read: 1,
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
    minutes_to_read: 1,
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
    category_ids: [2, 4],
    tag_ids: [1, 3],
    minutes_to_read: 1,
  },
];
