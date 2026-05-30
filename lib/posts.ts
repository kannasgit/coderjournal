export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  tags: string[];
  readTime: number;
  comments: number;
  shares: number;
}

export const posts: Post[] = [
  {
    slug: "advanced-typescript-patterns",
    title: "Advanced TypeScript Patterns in 2025",
    excerpt: "Dive deep into utility types, conditional types, and template literal types that will transform how you write TypeScript.",
    author: "coder_ayan",
    date: "2025-05-20",
    tags: ["TypeScript", "JavaScript"],
    readTime: 5,
    comments: 0,
    shares: 0,
  },
  {
    slug: "scalable-react-architecture",
    title: "Building Scalable React Architecture",
    excerpt: "How to structure large React apps with feature folders, shared components, and clean boundaries between domains.",
    author: "devjane",
    date: "2025-05-18",
    tags: ["React", "JavaScript"],
    readTime: 4,
    comments: 0,
    shares: 0,
  },
  
  {
    slug: "typescript-full-time",
    title: "Why I Switched From JavaScript to TypeScript Full-Time",
    excerpt: "After years of vanilla JS, I made the switch. Here's what I gained, what I lost, and whether it was worth it.",
    author: "rignd",
    date: "2025-05-08",
    tags: ["TypeScript", "JavaScript"],
    readTime: 3,
    comments: 0,
    shares: 0,
  },
];

export function getTrendingPosts(count = 3): Post[] {
  return [...posts]
    .sort((a, b) => (b.readTime + b.comments + b.shares) - (a.readTime + a.comments + a.shares))
    .slice(0, count);
}

export function getLatestPosts(count = 6): Post[] {
  return [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

export function getPostsByTag(tag: string): Post[] {
  return posts.filter(p =>
    p.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
  );
}