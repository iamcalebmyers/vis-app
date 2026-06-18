export const TIER_RANK = { solo: 0, investor: 1, agent: 2, brokerage: 3 };

export const TIER_LABELS = {
  solo: "Solo",
  investor: "Investor",
  agent: "Agent",
  brokerage: "Brokerage",
};

export const USAGE_LABELS = {
  solo: "Standard",
  investor: "Heavy",
  agent: "Professional",
  brokerage: "Team",
};

export const INVESTOR_CARD_TYPES = new Set(["rental", "deal", "arv", "cashflow", "caprate", "returns"]);

export function hasFeature(userTier, minTier) {
  return (TIER_RANK[userTier] ?? 0) >= (TIER_RANK[minTier] ?? 0);
}

export function usagePct(current, limit) {
  if (!limit) return 0;
  return Math.min(100, Math.round(((current || 0) / limit) * 100));
}

// Dollars of usage each tier includes per month. Mirrors the `included_usd`
// column in the tier_config table — keep in sync if you change it there.
export const TIER_INCLUDED_USD = { solo: 6, investor: 18, agent: 37.5, brokerage: 105 };

// Rough billed cost of one report at the 2x markup (~$0.15 real x 2). Display only.
export const PER_REPORT_USD = 0.30;

// Usage remaining for an account: included bucket left this cycle + prepaid balance.
export function usageRemaining(userRow) {
  if (!userRow) return null;
  const included = Math.max(
    (TIER_INCLUDED_USD[userRow.tier] || 0) - (userRow.included_used || 0),
    0
  );
  const dollars = included + (userRow.topup_balance || 0);
  return { dollars, reports: Math.max(0, Math.floor(dollars / PER_REPORT_USD)) };
}
