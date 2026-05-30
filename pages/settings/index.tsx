import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Post {
  slug: string;
  title: string;
  tags: string[];
  read_time: number;
  created_at: string;
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);

  useEffect(() => {
  if (session?.user) {
    loadDisplayName();
    fetchMyPosts();
  }
}, [session]);

async function loadDisplayName() {
  const { data } = await supabase
    .from("profiles")
    .select("display_name, name")
    .eq("email", session?.user?.email!)
    .single();

  if (data?.display_name) {
    setName(data.display_name);
  } else {
    setName(session?.user?.name || "");
  }
}
  async function fetchMyPosts() {
    setLoadingPosts(true);
    const { data } = await supabase
      .from("posts")
      .select("slug, title, tags, read_time, created_at")
      .eq("author_email", session?.user?.email!)
      .eq("published", true)
      .order("created_at", { ascending: false });

    setPosts(data || []);
    setLoadingPosts(false);
  }

  async function handleDelete(slug: string) {
    setDeletingSlug(slug);
    try {
      const res = await fetch("/api/delete-post", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (res.ok) {
        setPosts(prev => prev.filter(p => p.slug !== slug));
      } else {
        alert("Failed to delete post");
      }
    } catch {
      alert("Network error");
    } finally {
      setDeletingSlug(null);
      setConfirmSlug(null);
    }
  }

  async function handleSave() {
  if (!name.trim()) { setError("Name cannot be empty"); return; }
  setSaving(true);
  setError("");

  try {
    const res = await fetch("/api/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: name.trim() }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  } catch {
    setError("Failed to save — please try again");
  } finally {
    setSaving(false);
  }
}

  if (status === "unauthenticated") { router.push("/"); return null; }
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-[#555] text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="text-sm text-[#555] hover:text-[#c9a96e] transition-colors">
          ← Back to Journal
        </Link>
        <h1 className="font-heading text-4xl text-[#e8e4dc] mt-4">Settings</h1>
        <div className="mt-4 h-px bg-[#1e1d1b]" />
      </div>

      {/* Profile */}
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-widest text-[#c9a96e] mb-6">Profile</h2>
        <div className="flex items-center gap-4 mb-6 p-4 bg-[#141311] border border-[#2a2825] rounded-lg">
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-16 h-16 rounded-full border-2 border-[#2a2825]"
            />
          )}
          <div>
            <p className="text-[#e8e4dc] font-medium">{session?.user?.name}</p>
            <p className="text-sm text-[#555]">{session?.user?.email}</p>
            <p className="text-xs text-[#444] mt-1">Avatar synced from Google</p>
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <label className="text-xs text-[#555] uppercase tracking-widest">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-[#0f0e0c] border border-[#1e1d1b] rounded-md px-4 py-2.5 text-sm text-[#e8e4dc] focus:outline-none focus:border-[#c9a96e] transition-colors"
          />
        </div>
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#c9a96e] text-[#0f0e0c] text-sm font-medium rounded-md hover:bg-[#d4b87a] transition-colors disabled:opacity-50"
        >
          {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Changes"}
        </button>
      </section>

      {/* My Posts */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs uppercase tracking-widest text-[#c9a96e]">My Posts</h2>
          <span className="text-xs text-[#444]">{posts.length} published</span>
        </div>

        {loadingPosts ? (
          <p className="text-sm text-[#555]">Loading your posts...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 bg-[#141311] border border-[#2a2825] rounded-lg">
            <p className="text-[#555] text-sm">No posts yet.</p>
            <Link href="/editor" className="text-xs text-[#c9a96e] mt-2 inline-block hover:underline">
              Write your first post →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <div
                key={post.slug}
                className="bg-[#141311] border border-[#2a2825] rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-sm text-[#e8e4dc] hover:text-[#c9a96e] transition-colors cursor-pointer font-medium truncate">
                        {post.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#444]">
                        {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="text-xs text-[#444]">{post.read_time} min read</span>
                      <div className="flex gap-1">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs text-[#c9a96e]">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Delete button / confirm */}
                  <div className="shrink-0">
                    {confirmSlug === post.slug ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#555]">Sure?</span>
                        <button
                          onClick={() => handleDelete(post.slug)}
                          disabled={deletingSlug === post.slug}
                          className="px-2 py-1 text-xs bg-red-900/40 text-red-400 border border-red-900 rounded hover:bg-red-900/60 transition-colors disabled:opacity-50"
                        >
                          {deletingSlug === post.slug ? "..." : "Yes, delete"}
                        </button>
                        <button
                          onClick={() => setConfirmSlug(null)}
                          className="px-2 py-1 text-xs border border-[#2a2825] text-[#555] rounded hover:text-[#e8e4dc] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmSlug(post.slug)}
                        className="px-3 py-1 text-xs border border-[#2a2825] text-[#555] rounded hover:border-red-900 hover:text-red-400 transition-colors"
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Account */}
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-widest text-[#c9a96e] mb-6">Account</h2>
        <div className="bg-[#141311] border border-[#2a2825] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#e8e4dc]">Switch Account</p>
              <p className="text-xs text-[#555] mt-0.5">Sign in with a different Google account</p>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="px-4 py-2 text-sm border border-[#2a2825] text-[#e8e4dc] rounded-md hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors">
                Switch
            </button>
          </div>
          <div className="h-px bg-[#1e1d1b]" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#e8e4dc]">Sign Out</p>
              <p className="text-xs text-[#555] mt-0.5">Sign out of your account</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-2 text-sm border border-red-900 text-red-400 rounded-md hover:bg-red-900/20 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}