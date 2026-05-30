import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { getPostsByTag, posts, Post } from "../../lib/posts";

interface Props {
  tag: string;
  tagPosts: Post[];
}

export default function TagPage({ tag, tagPosts }: Props) {
  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#555] hover:text-[#c9a96e] transition-colors mb-6">
          ← Back to Journal
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-4xl text-[#e8e4dc]">
            #{tag}
          </h1>
          <span className="text-sm text-[#555] mt-2">
            {tagPosts.length} {tagPosts.length === 1 ? "post" : "posts"}
          </span>
        </div>
        <div className="mt-4 h-px bg-[#1e1d1b]" />
      </div>

      {/* Posts */}
      {tagPosts.length === 0 ? (
        <p className="text-[#555] text-sm">No posts found for this tag yet.</p>
      ) : (
        <div className="space-y-0">
          {tagPosts.map(post => (
            <Link href={`/blog/${post.slug}`} key={post.slug}>
              <div className="group flex items-center justify-between py-5 border-b border-[#1e1d1b] hover:border-[#2a2825] transition-colors cursor-pointer">
                <div className="flex-1 pr-6">
                  <h2 className="font-heading text-lg text-[#e8e4dc] group-hover:text-[#c9a96e] transition-colors mb-1">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[#555] leading-relaxed line-clamp-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#444]">
                    <span>@{post.author}</span>
                    <span>·</span>
                    <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span>·</span>
                    <span>💬 {post.comments}</span>
                    <span>↗ {post.shares}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs text-[#555]">{post.readTime} min read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tag = params?.tag as string;

  // Try mock data first
  const { getPostsByTag } = await import("../../lib/posts");
  const mockPosts = getPostsByTag(tag);

  // Also fetch from Supabase
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .contains("tags", [tag]);

  const dbPosts = (data || []).map((p: any) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || "",
    author: p.author_name || "anonymous",
    date: p.created_at,
    tags: p.tags || [],
    readTime: p.read_time || 1,
    comments: 0,
    shares: 0,
  }));

  // Merge and deduplicate
  const seen = new Set<string>();
  const allPosts = [...dbPosts, ...mockPosts].filter(p => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });

  return {
    props: {
      tag: tag.charAt(0).toUpperCase() + tag.slice(1),
      tagPosts: allPosts,
    },
    revalidate: 60,
  };
};