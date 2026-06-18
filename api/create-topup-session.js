import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const PRICE_BY_AMOUNT = {
  10: process.env.STRIPE_PRICE_TOPUP_10,
  25: process.env.STRIPE_PRICE_TOPUP_25,
  50: process.env.STRIPE_PRICE_TOPUP_50,
  100: process.env.STRIPE_PRICE_TOPUP_100,
};

// $50 and $100 top-ups are Agent tier and up.
const AGENT_ONLY = new Set([50, 100]);
const TIER_RANK = { solo: 0, investor: 1, agent: 2, brokerage: 3 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { amount, userId, email } = req.body || {};
  const amt = Number(amount);
  const priceId = PRICE_BY_AMOUNT[amt];
  if (!priceId || !userId || !email) {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  // Enforce the Agent+ gate for large top-ups on the server, not just the UI.
  if (AGENT_ONLY.has(amt) && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: u } = await supabase.from("users").select("tier").eq("id", userId).maybeSingle();
    if ((TIER_RANK[u?.tier] ?? 0) < TIER_RANK.agent) {
      return res.status(403).json({ error: "This top-up is available on the Agent plan and up." });
    }
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.origin || `http://localhost:${process.env.PORT || 3000}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      metadata: { userId, type: "topup", credit_usd: String(amt) },
      success_url: `${origin}/?topup=success`,
      cancel_url: `${origin}/?topup=cancel`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
