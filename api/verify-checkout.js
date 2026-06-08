import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const VALID_TIERS = new Set(["solo", "investor", "agent", "brokerage"]);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "Missing sessionId." });

  try {
    console.log("verify-checkout: retrieving session", sessionId);
    console.log("env check — STRIPE_SECRET_KEY set:", !!process.env.STRIPE_SECRET_KEY, "SUPABASE_URL set:", !!process.env.SUPABASE_URL, "SERVICE_ROLE set:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });
    console.log("session payment_status:", session.payment_status, "sub status:", session.subscription?.status);

    const subStatus = session.subscription?.status;
    const validPayment =
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required" ||
      subStatus === "active" ||
      subStatus === "trialing";

    if (!validPayment) {
      return res.status(400).json({ error: "Payment not complete.", payment_status: session.payment_status, sub_status: subStatus });
    }

    const userId = session.metadata.userId;
    const tier = VALID_TIERS.has(session.metadata.tier) ? session.metadata.tier : "solo";
    const needsHandle = ["agent", "brokerage"].includes(tier);

    res.json({
      tier,
      needsHandle,
      userId,
      email: session.customer_email,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription?.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
