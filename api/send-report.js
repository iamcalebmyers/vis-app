import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { reportType, reportData, agentProfileId = null, clientId = null } = req.body;
  if (!reportType || !reportData) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const token = randomBytes(16).toString("hex");

  const { error } = await supabase.from("shared_reports").insert({
    token,
    agent_profile_id: agentProfileId,
    client_id: clientId,
    report_type: reportType,
    report_data: reportData,
  });

  if (error) return res.status(500).json({ error: error.message });

  let base = "https://vis.realestate";
  if (agentProfileId) {
    const { data: agent } = await supabase
      .from("agent_profiles")
      .select("handle")
      .eq("id", agentProfileId)
      .maybeSingle();
    if (agent?.handle) base = `https://${agent.handle}.vis.realestate`;
  }

  res.json({ token, url: `${base}/report/${token}` });
}
