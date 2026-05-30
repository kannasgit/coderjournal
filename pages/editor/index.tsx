import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";

function renderPreview(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let codeLines: string[] = [];
  let inCode = false;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (!inCode) { inCode = true; codeLines = []; }
      else {
        inCode = false;
        elements.push(
          <pre key={i} className="bg-[#1a1917] border border-[#2a2825] rounded-lg p-4 overflow-x-auto my-6">
            <code className="text-sm text-[#e8e4dc] font-mono leading-relaxed">{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
      }
      i++; continue;
    }
    if (inCode) { codeLines.push(line); i++; continue; }

    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="font-heading text-2xl text-[#e8e4dc] mt-8 mb-3">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="font-heading text-4xl text-[#e8e4dc] mt-8 mb-4">{line.slice(2)}</h1>);
    } else if (line.startsWith("- ")) {
      elements.push(<li key={i} className="text-[#b0aa9f] leading-relaxed ml-4 list-disc my-1">{line.slice(2)}</li>);
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="my-3" />);
    } else {
      elements.push(<p key={i} className="text-[#b0aa9f] leading-relaxed my-3">{line}</p>);
    }
    i++;
  }
  return <>{elements}</>;
}

const SUGGESTED_TAGS = ["JavaScript", "TypeScript", "React", "Next.js", "DevOps"];
type EditorMode = "write" | "preview";

function PublishingAs({ email, fallback }: { email: string; fallback: string }) {
  const [name, setName] = useState(fallback);

  useEffect(() => {
    fetch(`/api/get-profile?email=${email}`)
      .then(r => r.json())
      .then(d => { if (d.display_name) setName(d.display_name); });
  }, [email]);

  return <>Publishing as {name}</>;
}

export default function EditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState<EditorMode>("write");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(`## Introduction\n\nStart writing your blog post here...\n\n## Main Section\n\nYour content goes here.\n\n\`\`\`ts\n// Your code example\nconsole.log("Hello, CoderJournal!");\n\`\`\``);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState("");

    function toggleTag(tag: string) {
        setSelectedTags(prev =>
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    }
    async function checkModeration(text: string): Promise<string | null> {
    const res = await fetch("/api/moderate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    });
     const data = await res.json();
     return data.violation || null; 
    }

  async function handlePublish() {
    setError("");
    setBlocked("");

    if (!title.trim()) { setError("Please add a title!"); return; }
    if (selectedTags.length === 0) { setError("Please select at least one tag!"); return; }

    setPublishing(true);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags: selectedTags }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "moderation") {
          setBlocked(data.word);
        } else {
          setError(data.error || "Something went wrong");
        }
        return;
      }

      router.push(`/blog/${data.slug}`);
    } catch {
      setError("Network error — please try again");
    } finally {
      setPublishing(false);
    }
  }

  // Not signed in
  if (status === "unauthenticated") {
    return (
      <div className="max-w-lg mx-auto text-center py-24">
        <div className="text-5xl mb-6">✍️</div>
        <h1 className="font-heading text-4xl text-[#e8e4dc] mb-4">Sign in to write</h1>
        <p className="text-[#555] mb-8">You need to be signed in to publish on The CoderJournal.</p>
        <button
          onClick={() => signIn("google")}
          className="px-6 py-2.5 bg-[#c9a96e] text-[#0f0e0c] text-sm font-medium rounded-md hover:bg-[#d4b87a] transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // Blocked screen
  if (blocked) {
    return (
      <div className="max-w-lg mx-auto text-center py-24">
        <div className="text-5xl mb-6">🚫</div>
        <h1 className="font-heading text-3xl text-[#e8e4dc] mb-4">Content Blocked</h1>
        <p className="text-[#555] mb-2">Your post violates our moderation policy.</p>
        <p className="text-sm text-red-400 mb-8">
          Flagged word: <span className="font-mono bg-[#1e1d1b] px-2 py-0.5 rounded">"{blocked}"</span>
        </p>
        <button
          onClick={() => setBlocked("")}
          className="px-5 py-2 border border-[#2a2825] text-[#e8e4dc] text-sm rounded-md hover:border-[#c9a96e] transition-colors"
        >
          ← Edit my post
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-sm text-[#555] hover:text-[#c9a96e] transition-colors">
          ← Back to Journal
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("write")}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              mode === "write" ? "bg-[#c9a96e] text-[#0f0e0c]" : "border border-[#2a2825] text-[#555] hover:text-[#e8e4dc]"
            }`}
          >
            ✏️ Write
          </button>
          <button
            onClick={() => setMode("preview")}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              mode === "preview" ? "bg-[#c9a96e] text-[#0f0e0c]" : "border border-[#2a2825] text-[#555] hover:text-[#e8e4dc]"
            }`}
          >
            👁️ Preview
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="Your post title..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full bg-transparent text-[#e8e4dc] placeholder-[#333] text-3xl font-heading border-b border-[#1e1d1b] focus:border-[#c9a96e] outline-none pb-3 mb-6 transition-colors"
      />

      {/* Write / Preview */}
      {mode === "write" ? (
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={20}
          className="w-full bg-[#0f0e0c] border border-[#1e1d1b] rounded-lg p-4 text-sm text-[#e8e4dc] placeholder-[#333] font-mono leading-relaxed focus:outline-none focus:border-[#2a2825] resize-none transition-colors"
        />
      ) : (
        <div className="min-h-100 bg-[#0a0908] border border-[#1e1d1b] rounded-lg p-6">
          {title && <h1 className="font-heading text-4xl text-[#e8e4dc] mb-6">{title}</h1>}
          {content.trim() ? renderPreview(content) : <p className="text-[#333] text-sm">Nothing to preview yet...</p>}
        </div>
      )}

        {/* Tags */}
    <div className="mt-6">
    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>
        Tags
    </p>

        {/* Selected tags */}
            {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
            {selectedTags.map(tag => (
            <span key={tag}
            className="flex items-center gap-1 px-3 py-1 text-sm rounded-md"
            style={{ backgroundColor: 'var(--gold)', color: '#0f0e0c' }}>
            #{tag}
            <button
                onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                className="ml-1 hover:opacity-70 transition-opacity font-bold">
                ×
            </button>
            </span>
            ))}
            </div>
        )}

  {/* Tag input */}
  <div className="flex gap-2 mb-3">
    <input
      type="text"
      placeholder="Type a tag and press Enter..."
      value={tagInput}
      onChange={e => setTagInput(e.target.value)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === ",") {
          e.preventDefault();
          const newTag = tagInput.trim().replace(/^#/, "");
          if (newTag && !selectedTags.includes(newTag) && selectedTags.length < 5) {
            setSelectedTags(prev => [...prev, newTag]);
          }
          setTagInput("");
        }
      }}
      className="flex-1 px-3 py-2 text-sm rounded-md focus:outline-none transition-colors"
      style={{
        backgroundColor: 'var(--bg-input)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
      }}
    />
    <button
      onClick={() => {
        const newTag = tagInput.trim().replace(/^#/, "");
        if (newTag && !selectedTags.includes(newTag) && selectedTags.length < 5) {
          setSelectedTags(prev => [...prev, newTag]);
        }
        setTagInput("");
      }}
      className="px-4 py-2 text-sm rounded-md transition-colors"
      style={{ border: '1px solid var(--border2)', color: 'var(--text)' }}
    >
      Add
    </button>
  </div>

  {/* Suggested tags */}
  <p className="text-xs mb-2" style={{ color: 'var(--text-dimmer)' }}>
    Suggested:
  </p>
  <div className="flex flex-wrap gap-2">
    {SUGGESTED_TAGS.filter(t => !selectedTags.includes(t)).map(tag => (
      <button
        key={tag}
        onClick={() => {
          if (!selectedTags.includes(tag) && selectedTags.length < 5) {
            setSelectedTags(prev => [...prev, tag]);
          }
        }}
        className="px-3 py-1 text-sm rounded-md border transition-colors hover:opacity-80"
        style={{ borderColor: 'var(--border2)', color: 'var(--text-dim)' }}
      >
        #{tag}
      </button>
    ))}
  </div>
  <p className="text-xs mt-2" style={{ color: 'var(--text-dimmer)' }}>
    Max 5 tags · Press Enter or comma to add
  </p>
</div>

      {/* Error */}
      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}

      {/* Publish bar */}
      <div className="mt-8 pt-6 border-t border-[#1e1d1b] flex items-center justify-between">
        <p className="text-xs text-[#444]">
            {session && <PublishingAs email={session.user.email!} fallback={session.user.name!} />}
        </p>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="px-6 py-2.5 bg-[#c9a96e] text-[#0f0e0c] text-sm font-medium rounded-md hover:bg-[#d4b87a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {publishing ? "⏳ Publishing..." : "Publish →"}
        </button>
      </div>
    </div>
  );
}