import type { SubmitEvent } from 'react';
import { useParams } from 'react-router';
import Button from '../components/Button.tsx';
import {
  CATEGORIES,
  type Category,
  POSTS,
  STAFF,
  type Tag,
  TAGS,
} from '../data/posts.ts';
import NotFound from './NotFound.tsx';

const FIELD_STYLE = 'flex flex-col gap-2';
const LABEL_STYLE = 'font-medium';
const HINT_STYLE = 'text-sm font-normal';
const INPUT_STYLE = 'rounded-xl border border-black bg-white px-4 py-2';

// Screen readers announce the input's required attribute, so they skip the star
const RequiredMark = () => (
  <span aria-hidden="true" className="text-brick-red">
    {' '}
    *
  </span>
);

interface CheckboxGroupProps {
  legend: string;
  name: string;
  items: (Category | Tag)[];
  checkedIds: number[];
}

// A fieldset groups the boxes, and its legend names the group for screen readers
const CheckboxGroup = ({
  legend,
  name,
  items,
  checkedIds,
}: CheckboxGroupProps) => (
  <fieldset className={FIELD_STYLE}>
    <legend className={LABEL_STYLE}>
      {legend} <span className={HINT_STYLE}>(choose one or more)</span>
      <RequiredMark />
    </legend>
    <div className="grid grid-cols-3 gap-x-6 gap-y-1">
      {items.map((item) => (
        <label key={item.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            name={name}
            value={item.id}
            defaultChecked={checkedIds.includes(item.id)}
          />
          {item.label}
        </label>
      ))}
    </div>
  </fieldset>
);

export default function PostForm() {
  // Only /blog/:id/edit has an id; /blog/new has none
  const { id } = useParams();
  const isEditing = id !== undefined;
  const post = POSTS.find((item) => item.id === Number(id));

  if (isEditing && post === undefined) {
    return <NotFound />;
  }

  // Saving arrives with the API; until then, stop the browser from reloading the page
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="rounded-xl bg-oat-milk px-8 py-12 text-xl leading-relaxed">
      <h1 className="text-center font-heading text-7xl leading-[1.2] font-bold">
        {isEditing ? 'Edit post' : 'New post'}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-10 flex max-w-4xl flex-col gap-6"
      >
        <label className={FIELD_STYLE}>
          <span className={LABEL_STYLE}>
            Post title
            <RequiredMark />
          </span>
          <input
            type="text"
            name="title"
            placeholder="Your blog post title"
            defaultValue={post?.title}
            required
            className={INPUT_STYLE}
          />
        </label>
        <label className={FIELD_STYLE}>
          <span className={LABEL_STYLE}>
            Post author
            <RequiredMark />
          </span>
          <select
            name="author_id"
            defaultValue={post?.author_id ?? ''}
            required
            className={INPUT_STYLE}
          >
            <option value="">Choose an author</option>
            {STAFF.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name}
              </option>
            ))}
          </select>
        </label>
        <CheckboxGroup
          legend="Post category"
          name="category_ids"
          items={CATEGORIES}
          checkedIds={post?.category_ids ?? []}
        />
        <CheckboxGroup
          legend="Post tags"
          name="tag_ids"
          items={TAGS}
          checkedIds={post?.tag_ids ?? []}
        />
        <label className={FIELD_STYLE}>
          <span className={LABEL_STYLE}>
            Post publish date
            <RequiredMark />
          </span>
          <input
            type="date"
            name="published_on"
            defaultValue={post?.published_on}
            required
            className={INPUT_STYLE}
          />
        </label>
        <label className={FIELD_STYLE}>
          <span className={LABEL_STYLE}>
            Post short summary
            <RequiredMark />
          </span>
          <textarea
            name="summary"
            rows={3}
            placeholder="Your blog post summary"
            defaultValue={post?.summary}
            required
            className={INPUT_STYLE}
          />
        </label>
        <label className={FIELD_STYLE}>
          <span className={LABEL_STYLE}>
            Post body text{' '}
            <span className={HINT_STYLE}>
              (separate paragraphs with a blank line)
            </span>
            <RequiredMark />
          </span>
          <textarea
            name="body"
            rows={12}
            placeholder="Your blog post text"
            defaultValue={post?.body}
            required
            className={INPUT_STYLE}
          />
        </label>
        <div className="flex gap-4">
          <Button type="submit">Save</Button>
          <Button variant="tertiary" to={isEditing ? `/blog/${id}` : '/blog'}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
