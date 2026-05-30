import React from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import { posts as mockPosts, Post } from "../lib/posts";

interface Props {
  trending: Post[];
  latest: Post[];
}

function TagBadge({ tag }: { tag: string }) {
  return (
    <Link href={`/tag/${tag.toLowerCase()}`}>
      <span className="inline-block px-2 py-0.5 text-xs rounded border border-[#2a2825] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#0f0e0c] transition-colors cursor-pointer">
        #{tag}
      </span>
    </Link>
  );
}

function TrendingCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <div className="group relative border rounded-lg overflow-hidden transition-all duration-300 cursor-pointer h-full flex flex-col"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border2)',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border2)')}>
        <div className="h-1 w-full bg-[#c9a96e]" />
        <div className="p-5 flex flex-col flex-1">
          <div className="flex gap-2 mb-3">
            {post.tags.slice(0, 1).map(tag => (
              <span key={tag} className="text-xs uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
                # {tag}
              </span>
            ))}
          </div>
          <h2 className="font-heading text-lg leading-snug mb-2 flex-1 transition-colors" style={{ color: 'var(--text)' }}>
            {post.title}
          </h2>
          <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs mt-auto" style={{ color: 'var(--text-dim)' }}>
            <span>@{post.author} · {post.readTime} min read</span>
            <span className="font-medium" style={{ color: 'var(--gold)' }}> ↗ Trending</span>
          </div>
          <div className="flex gap-4 mt-3 pt-3 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-dim)' }}>
            <span>💬 {post.comments}</span>
            <span>↗ {post.shares}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LatestRow({ post }: { post: Post }) {
  return (
    <div className="group flex items-center justify-between py-4 transition-colors cursor-pointer" style={{ borderBottom: '1px solid var(--border)' }}>
      <Link href={`/blog/${post.slug}`} className="flex-1 pr-4 min-w-0">
        <h3 className="font-heading text-base transition-colors" style={{ color: 'var(--text)' }}>
          {post.title}
        </h3>
        <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
          @{post.author} · {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </Link>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex gap-1 flex-wrap justify-end">
          {post.tags.slice(0, 1).map(tag => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
        <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-dim)' }}>{post.readTime} min</span>
      </div>
    </div>
  );
}

export default function Home({ trending = [], latest = [] }: Props) {
  return (
    <div className="space-y-12">
      {/* Trending Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#c9a96e]">Trending Blogs</h2>
          <div className="flex-1 h-px bg-[#1e1d1b]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trending.map(post => (
            <TrendingCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* Latest Section */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#c9a96e]">Latest Posts</h2>
          <div className="flex-1 h-px bg-[#1e1d1b]" />
        </div>
        <div>
          {latest.map(post => (
            <LatestRow key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: dbPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    // Convert Supabase posts to Post shape
    const realPosts: Post[] = (dbPosts || []).map(p => ({
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

    // Merge real posts + mock posts (real posts first)
    const allPosts = [...realPosts, ...mockPosts];

    // Remove duplicates by slug
    const seen = new Set<string>();
    const uniquePosts = allPosts.filter(p => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    });

    // Trending = sorted by readTime + comments + shares
    const trending = [...uniquePosts]
      .sort((a, b) => (b.readTime + b.comments + b.shares) - (a.readTime + a.comments + a.shares))
      .slice(0, 3);

    // Latest = sorted by date
    const latest = [...uniquePosts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);

    return { props: { trending, latest } };
  } catch (e) {
    console.error("Homepage error:", e);
    return {
      props: {
        trending: mockPosts
          .sort((a, b) => (b.readTime + b.comments + b.shares) - (a.readTime + a.comments + a.shares))
          .slice(0, 3),
        latest: mockPosts
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 8),
      },
    };
  }
}