import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const PROJECT_ID = "prj_HQDaQfu07DIN7jyadVWQEVHKiVYY";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { handle, userId, tier } = req.body;
  if (!handle || !userId || !tier) return res.status(400).json({ error: "Missing fields." });

  const cleaned = handle.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!cleaned) return res.status(400).json({ error: "Invalid handle." });

  // Check uniqueness
  const { data: existing } = await supabase.from("handle_registry").select("handle").eq("handle", cleaned).maybeSingle();
  if (existing) return res.status(409).json({ error: "Handle already taken." });

  // Provision Vercel subdomain
  if (VERCEL_API_TOKEN) {
    const vRes = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/domains`, {
      method: "POST",
      headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${cleaned}.vis.realestate` }),
    });
    if (!vRes.ok) {
      const err = await vRes.json();
      return res.status(500).json({ error: err.error?.message || "Subdomain provisioning failed." });
    }
  }

  // Insert handle registry + profile
  await supabase.from("handle_registry").insert({ handle: cleaned, account_id: userId, account_type: tier });

  if (tier === "agent") {
    await supabase.from("agent_profiles").upsert({ user_id: userId, handle: cleaned });
  } else if (tier === "brokerage") {
    await supabase.from("brokerage_profiles").upsert({ user_id: userId, handle: cleaned });
  }

  // Mark onboarding complete
  await supabase.from("users").update({ onboarding_complete: true }).eq("id", userId);

  res.json({ ok: true, handle: cleaned });
}
