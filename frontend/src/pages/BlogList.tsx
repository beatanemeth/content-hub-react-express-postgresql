import Button from '../components/Button.tsx';
import PostCard from '../components/PostCard.tsx';
import { POSTS } from '../data/posts.ts';

export default function BlogList() {
  const posts = POSTS;

  return (
    <div>
      <h1 className="text-center font-heading text-7xl leading-[1.2] font-bold">
        Blog
      </h1>
      <p className="mt-8 text-center text-xl leading-relaxed">
        Stories from the roastery, the café and our events: brewing tips, event
        reports and guest posts from our community.
      </p>
      <div className="mt-12 flex justify-end">
        <Button variant="secondary" to="/blog/new">
          Add new post
        </Button>
      </div>
      {posts.length === 0 ? (
        <p className="mt-12 text-xl leading-relaxed">No posts yet.</p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
