import type { Post } from '../api/posts.ts';
import { STAFF } from '../data/lists.ts';
import Button from './Button.tsx';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  // The post holds only the author's id; the staff list gives the name
  const author = STAFF.find((person) => person.id === post.author_id);

  return (
    // items-start keeps the Read button as wide as its text, not as wide as the card
    <article className="flex flex-col items-start gap-4 rounded-xl bg-oat-milk p-8">
      <h2 className="font-heading text-4xl leading-[1.3] font-semibold">
        {post.title}
      </h2>
      <p className="text-sm tracking-wide uppercase">
        {post.published_on} • {author?.full_name}
      </p>
      <p className="text-xl leading-relaxed">{post.summary}</p>
      <Button to={`/blog/${post.id}`}>Read</Button>
    </article>
  );
}
