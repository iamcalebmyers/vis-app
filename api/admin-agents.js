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
    const [{ data: brokerages }, { data: agents }] = await Promise.all([
      sb.from("brokerage_profiles").select("id, handle, ai_name, user_id, created_at, training_baseline"),
      sb.from("agent_profiles").select("id, handle, ai_name, user_id, brokerage_id, created_at, training_text, training_doc_text"),
    ]);
    return res.json({ brokerages: brokerages || [], agents: agents || [] });
  }

  // Remove agent from brokerage
  if (req.method === "PATCH") {
    const { agentId, brokerageId } = req.body || {};
    if (!agentId) return res.status(400).json({ error: "Missing agentId." });
    const { error } = await sb.from("agent_profiles").update({ brokerage_id: brokerageId || null }).eq("id", agentId);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
