import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { supabaseAdmin } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Must be signed in to comment" });

  const { post_slug, post_title, author_email, text } = req.body;

  if (!text?.trim()) return res.status(400).json({ error: "Comment cannot be empty" });

  // Save comment
  const { data, error } = await supabaseAdmin
    .from("comments")
    .insert({
      post_slug,
      author_name: session.user.name,
      author_email: session.user.email,
      text: text.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error("Comment error:", error);
    return res.status(500).json({ error: "Failed to save comment" });
  }

  // Create notification for post author (only if commenter isn't the author)
  if (author_email && author_email !== session.user.email) {
    await supabaseAdmin.from("notifications").insert({
      recipient_email: author_email,
      type: "comment",
      message: `${session.user.name} commented on your post`,
      post_slug,
      post_title,
      read: false,
    });
  }

  return res.status(200).json({ success: true, comment: data });
}