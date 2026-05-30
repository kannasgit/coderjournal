import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { supabaseAdmin } from "../../lib/supabase";
import bannedWords from "../../lib/banned-words.json";

const BANNED_WORDS = ["violence", "nudity", "hate", "abuse", "explicit"];

function moderateContent(text: string): string | null {
    const lower = text.toLowerCase();
    for (const word of bannedWords.banned) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(lower)) return word;
  }
  return null;
}

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "You must be signed in to publish" });

  const { title, content, tags } = req.body;

  if (!title?.trim()) return res.status(400).json({ error: "Title is required" });
  if (!content?.trim()) return res.status(400).json({ error: "Content is required" });
  if (!tags?.length) return res.status(400).json({ error: "At least one tag is required" });

  const violation = moderateContent(title + " " + content);
  if (violation) return res.status(400).json({ error: "moderation", word: violation });

  // Fetch display name from Supabase
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("display_name")
    .eq("email", session.user.email!)
    .single();

  const authorName = profile?.display_name || session.user.name;

  const slug = generateSlug(title) + "-" + Date.now();
  const readTime = estimateReadTime(content);

  const { data, error } = await supabaseAdmin
    .from("posts")
    .insert({
      slug,
      title: title.trim(),
      excerpt: content.trim().split("\n").find((l: string) => l.trim() && !l.startsWith("#")) || "",
      content: content.trim(),
      author_name: authorName,
      author_email: session.user.email,
      tags,
      read_time: readTime,
      published: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Failed to save post" });
  }

  return res.status(200).json({ success: true, slug: data.slug });
}