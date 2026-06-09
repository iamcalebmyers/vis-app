import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, name, brokerageProfileId } = req.body;
  if (!email || !brokerageProfileId) return res.status(400).json({ error: "Missing fields." });

  const { data: invited, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: "https://vis.realestate",
    data: { name: name || "", invited_as: "agent", brokerage_profile_id: brokerageProfileId },
  });

  if (inviteErr) {
    if (inviteErr.message?.toLowerCase().includes("already")) {
      return res.json({ ok: true, existing: true });
    }
    return res.status(500).json({ error: inviteErr.message });
  }

  res.json({ ok: true, userId: invited.user.id });
}
