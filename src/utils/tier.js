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
