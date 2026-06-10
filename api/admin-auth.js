export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password } = req.body || {};
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) return res.status(500).json({ error: "Admin password not configured." });
  if (!password || password !== ADMIN_PASSWORD) return res.status(401).json({ error: "Invalid password." });

  res.json({ token: ADMIN_PASSWORD });
}
