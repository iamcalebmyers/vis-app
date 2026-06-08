import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const PRICE_TO_TIER = {
    [process.env.STRIPE_PRICE_SOLO]: "solo",
    [process.env.STRIPE_PRICE_INVESTOR]: "investor",
    [process.env.STRIPE_PRICE_AGENT]: "agent",
    [process.env.STRIPE_PRICE_BROKERAGE]: "brokerage",
  };

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature failed: ${err.message}` });
  }

  const obj = event.data.object;

  switch (event.type) {
    case "customer.subscription.updated": {
      const priceId = obj.items?.data?.[0]?.price?.id;
      const tier = PRICE_TO_TIER[priceId];
      const customerId = obj.customer;
      const active = obj.status === "active" || obj.status === "trialing";

      if (tier) {
        await supabase
          .from("users")
          .update({ tier, suspended: !active })
          .eq("stripe_customer_id", customerId);
      } else {
        await supabase
          .from("users")
          .update({ suspended: !active })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const customerId = obj.customer;
      await supabase
        .from("users")
        .update({ tier: "solo", suspended: false, stripe_subscription_id: null })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "invoice.payment_failed": {
      const customerId = obj.customer;
      await supabase
        .from("users")
        .update({ suspended: true })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  res.json({ received: true });
}

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
