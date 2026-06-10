import { createClient } from "@supabase/supabase-js";

function adminSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function checkAuth(req, res) {
  const auth = req.headers["authorization"] || "";
  const token = auth.replace("Bearer ", "").trim();
  if (!process.env.ADMIN_PASSWORD || token !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  const sb = adminSupabase();

  if (req.method === "GET") {
    const { data, error } = await sb.from("tier_config").select("*").order("monthly_price", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    // Also fetch agent + brokerage counts
    const { data: users } = await sb.from("users").select("tier, id");
    const counts = {};
    (users || []).forEach(u => { counts[u.tier] = (counts[u.tier] || 0) + 1; });
    return res.json({ tiers: data, counts });
  }

  if (req.method === "PATCH") {
    const { tier, monthly_price, usage_limit, overage_rate } = req.body || {};
    if (!tier) return res.status(400).json({ error: "Missing tier." });
    const { error } = await sb.from("tier_config").update({ monthly_price, usage_limit, overage_rate, updated_at: new Date().toISOString() }).eq("tier", tier);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
