import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { supabaseAdmin } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Must be signed in" });

  const { slug } = req.body;
  if (!slug) return res.status(400).json({ error: "Slug is required" });

  // Only delete if the post belongs to this user
  const { error } = await supabaseAdmin
    .from("posts")
    .delete()
    .eq("slug", slug)
    .eq("author_email", session.user.email!);

  if (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ error: "Failed to delete post" });
  }

  return res.status(200).json({ success: true });
}