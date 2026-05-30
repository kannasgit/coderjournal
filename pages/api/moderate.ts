import type { NextApiRequest, NextApiResponse } from "next";
import bannedWords from "../../lib/banned-words.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });

  const lower = text.toLowerCase();
  const violation = bannedWords.banned.find(word => lower.includes(word));

  return res.status(200).json({
    passed: !violation,
    violation: violation || null,
  });
}