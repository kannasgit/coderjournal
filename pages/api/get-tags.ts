import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data } = await supabaseAdmin
    .from("posts")
    .select("tags")
    .eq("published", true);

  // Flatten all tags from all posts into unique sorted list
  const allTags = new Set<string>();

  (data || []).forEach(post => {
    (post.tags || []).forEach((tag: string) => allTags.add(tag));
  });

  return res.status(200).json({ tags: Array.from(allTags).sort() });
}