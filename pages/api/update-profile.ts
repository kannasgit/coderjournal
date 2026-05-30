import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { supabaseAdmin } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not signed in" });

  const { display_name } = req.body;
  if (!display_name?.trim()) return res.status(400).json({ error: "Name is required" });

  // Upsert profile with display name
  const { error } = await supabaseAdmin
    .from("profiles")
    .upsert({
      email: session.user.email!,
      display_name: display_name.trim(),
      name: session.user.name,
      avatar_url: session.user.image,
    }, { onConflict: "email" });

  if (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }

  return res.status(200).json({ success: true });
}