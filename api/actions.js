// Combined onboarding/action endpoint — routes on body.action so it stays one
// Vercel function. Replaces invite-agent, invite-client, claim-handle, send-report.
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const PROJECT_ID = "prj_HQDaQfu07DIN7jyadVWQEVHKiVYY";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { action } = req.body || {};

  try {
    // ── Invite an agent (brokerage → agent) ──
    if (action === "invite-agent") {
      const { email, name, brokerageProfileId } = req.body;
      if (!email || !brokerageProfileId) return res.status(400).json({ error: "Missing fields." });
      const { data: invited, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: "https://vis.realestate",
        data: { name: name || "", invited_as: "agent", brokerage_profile_id: brokerageProfileId },
      });
      if (inviteErr) {
        if (inviteErr.message?.toLowerCase().includes("already")) return res.json({ ok: true, existing: true });
        return res.status(500).json({ error: inviteErr.message });
      }
      return res.json({ ok: true, userId: invited.user.id });
    }

    // ── Invite a client (agent → client) ──
    if (action === "invite-client") {
      const { email, name, agentProfileId, agentHandle } = req.body;
      if (!email || !agentProfileId) return res.status(400).json({ error: "Missing fields." });
      const redirectTo = agentHandle ? `https://${agentHandle}.vis.realestate` : "https://vis.realestate";

      let userId;
      const { data: invited, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: { name: name || "" },
      });
      if (inviteErr) {
        if (inviteErr.message?.toLowerCase().includes("already")) {
          const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
          const existing = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
          if (!existing) return res.status(400).json({ error: "User already exists but could not be found." });
          userId = existing.id;
        } else {
          return res.status(500).json({ error: inviteErr.message });
        }
      } else {
        userId = invited.user.id;
      }

      const { data, error: cpErr } = await supabase
        .from("client_profiles")
        .upsert({ user_id: userId, agent_id: agentProfileId, name: name || "", email: email.toLowerCase() }, { onConflict: "user_id,agent_id" })
        .select()
        .single();
      if (cpErr) return res.status(500).json({ error: cpErr.message });
      return res.json({ ok: true, client: data });
    }

    // ── Claim a subdomain handle ──
    if (action === "claim-handle") {
      const { handle, userId, tier } = req.body;
      if (!handle || !userId || !tier) return res.status(400).json({ error: "Missing fields." });
      const cleaned = handle.toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (!cleaned) return res.status(400).json({ error: "Invalid handle." });

      const { data: existing } = await supabase.from("handle_registry").select("handle").eq("handle", cleaned).maybeSingle();
      if (existing) return res.status(409).json({ error: "Handle already taken." });

      if (process.env.VERCEL_API_TOKEN) {
        const vRes = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/domains`, {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ name: `${cleaned}.vis.realestate` }),
        });
        if (!vRes.ok) {
          const err = await vRes.json();
          return res.status(500).json({ error: err.error?.message || "Subdomain provisioning failed." });
        }
      }

      await supabase.from("handle_registry").insert({ handle: cleaned, account_id: userId, account_type: tier });
      if (tier === "agent") await supabase.from("agent_profiles").upsert({ user_id: userId, handle: cleaned });
      else if (tier === "brokerage") await supabase.from("brokerage_profiles").upsert({ user_id: userId, handle: cleaned });
      await supabase.from("users").update({ onboarding_complete: true }).eq("id", userId);
      return res.json({ ok: true, handle: cleaned });
    }

    // ── Create a shareable report link ──
    if (action === "send-report") {
      const { reportType, reportData, agentProfileId = null, clientId = null } = req.body;
      if (!reportType || !reportData) return res.status(400).json({ error: "Missing required fields." });
      const token = randomBytes(16).toString("hex");
      const { error } = await supabase.from("shared_reports").insert({
        token, agent_profile_id: agentProfileId, client_id: clientId, report_type: reportType, report_data: reportData,
      });
      if (error) return res.status(500).json({ error: error.message });

      let base = "https://vis.realestate";
      if (agentProfileId) {
        const { data: agent } = await supabase.from("agent_profiles").select("handle").eq("id", agentProfileId).maybeSingle();
        if (agent?.handle) base = `https://${agent.handle}.vis.realestate`;
      }
      return res.json({ token, url: `${base}/report/${token}` });
    }

    return res.status(400).json({ error: "Unknown action." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
