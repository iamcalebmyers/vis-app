// Combined admin endpoint — routes on ?resource= so it stays one Vercel
// function. Replaces admin-auth, admin-users, admin-tier, admin-agents.
import { createClient } from "@supabase/supabase-js";

function sb() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function checkAuth(req, res) {
  const token = (req.headers["authorization"] || "").replace("Bearer ", "").trim();
  if (!process.env.ADMIN_PASSWORD || token !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  const resource = req.query?.resource;

  // ── Login (the only unauthenticated resource) ──
  if (resource === "auth") {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const { password } = req.body || {};
    if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: "Admin password not configured." });
    if (!password || password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: "Invalid password." });
    return res.json({ token: process.env.ADMIN_PASSWORD });
  }

  if (!checkAuth(req, res)) return;
  const db = sb();

  // ── Users ──
  if (resource === "users") {
    if (req.method === "GET") {
      const { data, error } = await db.from("users").select("*").order("created_at", { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ users: data });
    }
    if (req.method === "PATCH") {
      const { userId, action, value } = req.body || {};
      if (!userId || !action) return res.status(400).json({ error: "Missing userId or action." });
      let update = {};
      if (action === "tier")        update = { tier: value };
      if (action === "comp")        update = { comped: true, comp_expires_at: value };
      if (action === "usage_limit") update = { usage_limit: Number(value) };
      if (action === "reset_usage") update = { usage_current: 0, overage_accrued: 0, included_used: 0 };
      if (action === "suspend")     update = { suspended: true };
      if (action === "reactivate")  update = { suspended: false };
      if (action === "uncomp")      update = { comped: false, comp_expires_at: null };
      const { error } = await db.from("users").update(update).eq("id", userId);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ ok: true });
    }
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Tier config ──
  if (resource === "tier") {
    if (req.method === "GET") {
      const { data, error } = await db.from("tier_config").select("*").order("monthly_price", { ascending: true });
      if (error) return res.status(500).json({ error: error.message });
      const { data: users } = await db.from("users").select("tier, id");
      const counts = {};
      (users || []).forEach((u) => { counts[u.tier] = (counts[u.tier] || 0) + 1; });
      return res.json({ tiers: data, counts });
    }
    if (req.method === "PATCH") {
      const { tier, monthly_price, usage_limit, overage_rate } = req.body || {};
      if (!tier) return res.status(400).json({ error: "Missing tier." });
      const { error } = await db.from("tier_config")
        .update({ monthly_price, usage_limit, overage_rate, updated_at: new Date().toISOString() })
        .eq("tier", tier);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ ok: true });
    }
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Agents / brokerages ──
  if (resource === "agents") {
    if (req.method === "GET") {
      const [{ data: brokerages }, { data: agents }] = await Promise.all([
        db.from("brokerage_profiles").select("id, handle, ai_name, user_id, created_at, training_baseline"),
        db.from("agent_profiles").select("id, handle, ai_name, user_id, brokerage_id, created_at, training_text, training_doc_text"),
      ]);
      return res.json({ brokerages: brokerages || [], agents: agents || [] });
    }
    if (req.method === "PATCH") {
      const { agentId, brokerageId } = req.body || {};
      if (!agentId) return res.status(400).json({ error: "Missing agentId." });
      const { error } = await db.from("agent_profiles").update({ brokerage_id: brokerageId || null }).eq("id", agentId);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ ok: true });
    }
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(400).json({ error: "Unknown admin resource." });
}
