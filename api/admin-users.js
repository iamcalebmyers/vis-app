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
    const { data, error } = await sb.from("users").select("*").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ users: data });
  }

  if (req.method === "PATCH") {
    const { userId, action, value } = req.body || {};
    if (!userId || !action) return res.status(400).json({ error: "Missing userId or action." });

    let update = {};
    if (action === "tier")          update = { tier: value };
    if (action === "comp")          update = { comped: true, comp_expires_at: value };
    if (action === "usage_limit")   update = { usage_limit: Number(value) };
    if (action === "reset_usage")   update = { usage_current: 0, overage_accrued: 0 };
    if (action === "suspend")       update = { suspended: true };
    if (action === "reactivate")    update = { suspended: false };
    if (action === "uncomp")        update = { comped: false, comp_expires_at: null };

    const { error } = await sb.from("users").update(update).eq("id", userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
