import { useParams } from 'react-router';
import Button from '../components/Button.tsx';
import { CATEGORIES, POSTS, STAFF, TAGS } from '../data/posts.ts';
import NotFound from './NotFound.tsx';

export default function Post() {
  const { id } = useParams();
  // useParams gives every URL part as a string; the post ids are numbers
  const post = POSTS.find((item) => item.id === Number(id));

  if (post === undefined) {
    return <NotFound />;
  }

  const author = STAFF.find((person) => person.id === post.author_id);
  const categories = post.category_ids
    .map(
      (categoryId) => CATEGORIES.find((item) => item.id === categoryId)?.label,
    )
    .join(' • ');
  const tags = post.tag_ids
    .map((tagId) => TAGS.find((item) => item.id === tagId)?.label)
    .join(', ');
  const paragraphs = post.body.split('\n\n');

  return (
    // The text size set here is inherited by every part that does not set its own
    <article className="rounded-xl bg-oat-milk px-8 py-12 text-xl leading-relaxed">
      <header className="text-center">
        <h1 className="font-heading text-7xl leading-[1.2] font-bold">
          {post.title}
        </h1>
        <p className="mt-6 text-sm tracking-wide uppercase">
          {post.published_on} • {author?.full_name} • {post.minutes_to_read} min
          read
        </p>
        <p className="mx-auto mt-8 max-w-4xl">{post.summary}</p>
      </header>
      <hr className="mx-auto mt-10 max-w-xl" />
      <p className="mt-10 text-center text-sm tracking-wide">{categories}</p>
      <div className="mx-auto mt-10 max-w-4xl">
        <div className="flex flex-col gap-6">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-12 text-sm italic">{tags}</p>
        <div className="mt-12 flex gap-4">
          <Button variant="secondary" to={`/blog/${post.id}/edit`}>
            Edit
          </Button>
          <Button variant="tertiary" type="button">
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}
