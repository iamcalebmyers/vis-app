// Combined billing endpoint — routes on body.action so it stays one Vercel
// function. Replaces create-checkout-session, create-topup-session,
// billing-portal, and verify-checkout.
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const TOPUP_PRICE = {
  10: process.env.STRIPE_PRICE_TOPUP_10,
  25: process.env.STRIPE_PRICE_TOPUP_25,
  50: process.env.STRIPE_PRICE_TOPUP_50,
  100: process.env.STRIPE_PRICE_TOPUP_100,
};
const TOPUP_AGENT_ONLY = new Set([50, 100]);
const TIER_RANK = { solo: 0, investor: 1, agent: 2, brokerage: 3 };
const VALID_TIERS = new Set(["solo", "investor", "agent", "brokerage"]);

function sb() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.origin || `http://localhost:${process.env.PORT || 3000}`;
  const { action } = req.body || {};

  try {
    // ── Subscription checkout ──
    if (action === "checkout") {
      const { priceId, userId, email, tier } = req.body;
      if (!priceId || !userId || !email) return res.status(400).json({ error: "Missing required fields." });
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: email,
        metadata: { userId, tier: tier || "solo" },
        success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?checkout=cancel`,
      });
      return res.json({ url: session.url });
    }

    // ── Prepaid usage top-up ──
    if (action === "topup") {
      const { amount, userId, email } = req.body;
      const amt = Number(amount);
      const priceId = TOPUP_PRICE[amt];
      if (!priceId || !userId || !email) return res.status(400).json({ error: "Missing or invalid fields." });

      if (TOPUP_AGENT_ONLY.has(amt)) {
        const { data: u } = await sb().from("users").select("tier").eq("id", userId).maybeSingle();
        if ((TIER_RANK[u?.tier] ?? 0) < TIER_RANK.agent) {
          return res.status(403).json({ error: "This top-up is available on the Agent plan and up." });
        }
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: email,
        metadata: { userId, type: "topup", credit_usd: String(amt) },
        success_url: `${origin}/?topup=success`,
        cancel_url: `${origin}/?topup=cancel`,
      });
      return res.json({ url: session.url });
    }

    // ── Stripe billing portal ──
    if (action === "portal") {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "Missing userId." });
      const { data: user } = await sb().from("users").select("stripe_customer_id").eq("id", userId).maybeSingle();
      if (!user?.stripe_customer_id) return res.status(404).json({ error: "No billing account found." });
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripe_customer_id,
        return_url: `${origin}/`,
      });
      return res.json({ url: session.url });
    }

    // ── Verify a completed checkout (sets tier) ──
    if (action === "verify") {
      const { sessionId } = req.body;
      if (!sessionId) return res.status(400).json({ error: "Missing sessionId." });
      const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
      const subStatus = session.subscription?.status;
      const validPayment =
        session.payment_status === "paid" ||
        session.payment_status === "no_payment_required" ||
        subStatus === "active" ||
        subStatus === "trialing";
      if (!validPayment) {
        return res.status(400).json({ error: "Payment not complete.", payment_status: session.payment_status, sub_status: subStatus });
      }
      const tier = VALID_TIERS.has(session.metadata.tier) ? session.metadata.tier : "solo";
      return res.json({
        tier,
        needsHandle: ["agent", "brokerage"].includes(tier),
        userId: session.metadata.userId,
        email: session.customer_email,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription?.id,
      });
    }

    return res.status(400).json({ error: "Unknown billing action." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
