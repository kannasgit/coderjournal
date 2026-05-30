import React, { useState } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { posts, Post } from "../../lib/posts";
import { getPostBySlug } from "../../lib/mdx";

interface Props {
  post: Post & { content: string };
}

interface Comment {
  id: number;
  author: string;
  text: string;
  date: string;
}

const MOCK_COMMENTS: Comment[] = [
 
];

function renderContent(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let codeLines: string[] = [];
  let inCode = false;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (!inCode) {
        inCode = true;
        codeLines = [];
      } else {
        inCode = false;
        const codeKey = `code-${i}`;
        elements.push(
          <pre key={codeKey} className="bg-[#1a1917] border border-[#2a2825] rounded-lg p-4 overflow-x-auto my-6">
            <code className="text-sm text-[#e8e4dc] font-mono leading-relaxed">
              {codeLines.join("\n")}
            </code>
          </pre>
        );
        codeLines = [];
      }
      i++;
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="font-heading text-2xl text-[#e8e4dc] mt-10 mb-4">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="font-heading text-4xl text-[#e8e4dc] mt-10 mb-4">
          {line.slice(2)}
        </h1>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="my-2" />);
    } else {
      elements.push(
        <p key={i} className="text-[#b0aa9f] leading-relaxed text-base my-3">
          {line}
        </p>
      );
    }
    i++;
  }

  return <>{elements}</>;
}

export default function BlogPost({ post }: Props) {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [author, setAuthor] = useState("");
  const [copied, setCopied] = useState(false);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

 async function handleComment() {
  if (!newComment.trim() || !author.trim()) return;

  const res = await fetch("/api/comment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      post_slug: post.slug,
      post_title: post.title,
      author_email: post.author,
      text: newComment.trim(),
    }),
  });

  const data = await res.json();
  if (!res.ok) { alert(data.error); return; }

  setComments(prev => [...prev, {
    id: prev.length + 1,
    author: author.trim(),
    text: newComment.trim(),
    date: new Date().toISOString().split("T")[0],
  }]);
  setNewComment("");
  setAuthor("");
}

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#555] hover:text-[#c9a96e] transition-colors mb-10">
        ← Back to Journal
      </Link>

      <div className="mb-10">
        <div className="flex gap-2 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs uppercase tracking-widest text-[#c9a96e]">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="font-heading text-4xl md:text-5xl text-[#e8e4dc] leading-tight mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-[#555]">
          <span>@{post.author}</span>
          <span>·</span>
          <span>{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          <span>·</span>
          <span>{post.readTime} min read</span>
        </div>
        <div className="mt-6 h-px bg-[#1e1d1b]" />
      </div>

      <article className="mb-16">
        {renderContent(post.content)}
      </article>

      <div className="flex items-center justify-between py-6 border-t border-b border-[#1e1d1b] mb-12">
        <div className="flex gap-4 text-sm text-[#555]">
          <span>💬 {post.comments} comments</span>
          <span>↗ {post.shares} shares</span>
        </div>
        <button
          onClick={handleShare}
          className="px-4 py-2 text-sm border border-[#2a2825] text-[#e8e4dc] rounded-md hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
        >
          {copied ? "✓ Copied!" : "↗ Share link"}
        </button>
      </div>

      <section>
        <h2 className="font-heading text-2xl text-[#e8e4dc] mb-6">
          Comments ({comments.length})
        </h2>
        <div className="space-y-4 mb-8">
          {comments.map(c => (
            <div key={c.id} className="bg-[#141311] border border-[#2a2825] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#c9a96e] font-medium">@{c.author}</span>
                <span className="text-xs text-[#444]">{c.date}</span>
              </div>
              <p className="text-sm text-[#b0aa9f] leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#141311] border border-[#2a2825] rounded-lg p-5 space-y-3">
          <h3 className="text-sm text-[#555] uppercase tracking-widest">Leave a comment</h3>
          <input
            type="text"
            placeholder="Your name"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            className="w-full bg-[#0f0e0c] border border-[#2a2825] rounded-md px-3 py-2 text-sm text-[#e8e4dc] placeholder-[#444] focus:outline-none focus:border-[#c9a96e] transition-colors"
          />
          <textarea
            placeholder="Write your comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            rows={3}
            className="w-full bg-[#0f0e0c] border border-[#2a2825] rounded-md px-3 py-2 text-sm text-[#e8e4dc] placeholder-[#444] focus:outline-none focus:border-[#c9a96e] transition-colors resize-none"
          />
          <button
            onClick={handleComment}
            className="px-5 py-2 bg-[#c9a96e] text-[#0f0e0c] text-sm font-medium rounded-md hover:bg-[#d4b87a] transition-colors"
          >
            Post Comment
          </button>
        </div>
      </section>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  // First try local MDX file
  const localPost = getPostBySlug(slug);
  if (localPost) return { props: { post: localPost } };

  // Then try Supabase
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return { notFound: true };

  return {
    props: {
      post: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        author: data.author_name,
        date: data.created_at,
        tags: data.tags,
        readTime: data.read_time,
        comments: 0,
        shares: 0,
        content: data.content,
      },
    },
    revalidate: 60,
  };
};