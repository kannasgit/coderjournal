import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Post } from "./posts";

export function getPostBySlug(slug: string): (Post & { content: string }) | null {
  const postsDir = path.join(process.cwd(), "posts");
  const filePath = path.join(postsDir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title,
    excerpt: data.excerpt,
    author: data.author,
    date: data.date,
    tags: data.tags || [],
    readTime: data.readTime || 1,
    comments: data.comments || 0,
    shares: data.shares || 0,
    content,
  };
}