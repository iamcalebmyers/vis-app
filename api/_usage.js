// Shared usage metering: turn an Anthropic response into a billed dollar amount
// and charge it against the account (included monthly bucket first, then prepaid
// balance). Underscore-prefixed so Vercel treats it as a helper, not a route.
import { createClient } from "@supabase/supabase-js";

// Per-million-token prices (USD), keyed by model. Keep in sync with VIS_MODEL.
const RATES = {
  "claude-sonnet-4-6": { in: 3, out: 15 },
  "claude-haiku-4-5":  { in: 1, out: 5 },
  "claude-opus-4-8":   { in: 5, out: 25 },
  "claude-opus-4-7":   { in: 5, out: 25 },
};
const SEARCH_COST = 0.01;   // ~$10 per 1,000 web searches
const MARKUP = 2;           // 2x markup on real cost
const MIN_PREFLIGHT = 0.30; // require at least this much available before an expensive call

function rate(model) {
  return RATES[model] || RATES["claude-sonnet-4-6"];
}

function sb() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Number of web searches the model actually ran (server_tool_use blocks).
export function countSearches(response) {
  try {
    return (response?.content || []).filter(
      (b) => b.type === "server_tool_use" && b.name === "web_search"
    ).length;
  } catch {
    return 0;
  }
}

// Real $ cost of one call (no markup).
export function rawCost(usage, model, searches = 0) {
  const r = rate(model);
  const inTok =
    (usage?.input_tokens || 0) +
    (usage?.cache_read_input_tokens || 0) +
    (usage?.cache_creation_input_tokens || 0);
  const outTok = usage?.output_tokens || 0;
  return (inTok / 1e6) * r.in + (outTok / 1e6) * r.out + searches * SEARCH_COST;
}

// What we charge the account = real cost x markup.
export function billedCost(usage, model, searches = 0) {
  return rawCost(usage, model, searches) * MARKUP;
}

// Can this account cover a call right now? Returns { ok, available }.
// If Supabase or the user isn't configured, never gate (ok: true).
export async function preflight(userId) {
  const supabase = sb();
  if (!userId || !supabase) return { ok: true, available: null };
  const { data: u } = await supabase
    .from("users")
    .select("included_used, topup_balance, tier")
    .eq("id", userId)
    .maybeSingle();
  if (!u) return { ok: true, available: null }; // not a metered account (e.g. client)
  const { data: tc } = await supabase
    .from("tier_config")
    .select("included_usd")
    .eq("tier", u.tier)
    .maybeSingle();
  const includedLeft = Math.max((tc?.included_usd || 0) - (u.included_used || 0), 0);
  const available = includedLeft + (u.topup_balance || 0);
  return { ok: available >= MIN_PREFLIGHT, available };
}

// Charge the metered cost via the atomic RPC. Best-effort — never throws,
// so a metering hiccup can't fail the user's actual request.
export async function meter(userId, { usage, model, searches = 0, kind }) {
  const supabase = sb();
  if (!userId || !supabase) return;
  const amount = +billedCost(usage, model, searches).toFixed(4);
  if (amount <= 0) return;
  try {
    await supabase.rpc("charge_usage", {
      p_user_id: userId,
      p_amount: amount,
      p_kind: kind,
      p_tokens_in: usage?.input_tokens || 0,
      p_tokens_out: usage?.output_tokens || 0,
      p_searches: searches,
    });
  } catch {
    /* don't fail the request over metering */
  }
}
