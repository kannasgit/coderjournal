import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("display_name, name, avatar_url")
    .eq("email", email)
    .single();

  return res.status(200).json(data || {});
}