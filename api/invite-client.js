import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, name, agentProfileId, agentHandle } = req.body;
  if (!email || !agentProfileId) return res.status(400).json({ error: "Missing fields." });

  const redirectTo = agentHandle
    ? `https://${agentHandle}.vis.realestate`
    : "https://vis.realestate";

  let userId;
  const { data: invited, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: { name: name || "" },
  });

  if (inviteErr) {
    if (inviteErr.message?.toLowerCase().includes("already")) {
      const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const existing = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
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
    .upsert(
      { user_id: userId, agent_id: agentProfileId, name: name || "", email: email.toLowerCase() },
      { onConflict: "user_id,agent_id" }
    )
    .select()
    .single();

  if (cpErr) return res.status(500).json({ error: cpErr.message });

  res.json({ ok: true, client: data });
}
