import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId." });

  const { data: user } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  if (!user?.stripe_customer_id) {
    return res.status(404).json({ error: "No billing account found." });
  }

  const origin = req.headers.origin || `http://localhost:${process.env.PORT || 3000}`;

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${origin}/`,
  });

  res.json({ url: session.url });
}
