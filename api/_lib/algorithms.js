// Heuristic derived fields computed from real housing + macro data.
// These replace the hardcoded mock values for market scores, cycle phase,
// overvaluation, and forecasts once live data is available.
//
// All formulas are intentionally simple and transparent — the goal is
// directionally correct numbers, not ML-precision estimates (Phase 6).

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)) }

// Inventory rising YoY → lower score (more supply = buyer's market)
function scoreInventory(current, yearAgo) {
  if (!yearAgo) return 50
  const yoyPct = (current - yearAgo) / yearAgo * 100
  return clamp(50 - yoyPct * 0.6, 10, 90)
}

// DOM rising YoY → lower score
function scoreDom(current, yearAgo) {
  if (!yearAgo) return 50
  const yoyPct = (current - yearAgo) / yearAgo * 100
  return clamp(50 - yoyPct * 0.7, 10, 90)
}

// Price YoY +8% → score ~98; -5% → score ~20
function scorePriceYoy(yoy) {
  return clamp(50 + yoy * 6, 10, 90)
}

function sbLabel(score) {
  if (score >= 75) return "Strong Seller's Market"
  if (score >= 60) return "Seller's Market"
  if (score >= 45) return "Slight Seller Advantage"
  if (score >= 35) return "Balanced"
  if (score >= 20) return "Buyer's Advantage"
  return "Buyer's Market"
}

function cyclePhase(priceYoy, invYoy, domCurrent, domYearAgo) {
  const domRising = domYearAgo > 0 && domCurrent > domYearAgo * 1.05
  if (priceYoy > 5  && invYoy < 10)  return 'expansion'
  if (priceYoy > 2  && invYoy > 20)  return 'peak'
  if (priceYoy < 0  && invYoy > 25)  return 'hyper_supply'
  if (priceYoy < -2 && invYoy < 0)   return 'recession'
  if (priceYoy < 1  && !domRising)   return 'recovery'
  return 'expansion'
}

function scoreGrade(score) {
  if (score >= 85) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 75) return 'A-'
  if (score >= 70) return 'B+'
  if (score >= 65) return 'B'
  if (score >= 60) return 'B-'
  if (score >= 55) return 'C+'
  if (score >= 50) return 'C'
  if (score >= 45) return 'C-'
  return 'D'
}

// Main export: given a snapshot with real housing values and live macro,
// returns an object of derived fields to merge into the snapshot.
export function computeDerivedFields(snap, macroBlock) {
  const rate30yr = macroBlock?.rate30yr?.value ?? snap.rate_30yr?.rate ?? 6.8
  const fedFunds = macroBlock?.fedFunds?.value ?? 4.0
  const result = {}

  const inv = snap.inventory
  const dom = snap.dom
  const hp  = snap.home_price

  const hasInventory = inv?.current != null && inv?.yearAgo != null
  const hasDom       = dom?.current != null && dom?.yearAgo != null
  const hasPriceYoy  = hp?.yoy != null

  // Market score & seller/buyer meter
  if (hasInventory || hasDom || hasPriceYoy) {
    const invScore   = hasInventory ? scoreInventory(inv.current, inv.yearAgo) : 50
    const domScore   = hasDom       ? scoreDom(dom.current, dom.yearAgo)       : 50
    const priceScore = hasPriceYoy  ? scorePriceYoy(hp.yoy)                    : 50
    const composite  = Math.round(invScore * 0.35 + domScore * 0.35 + priceScore * 0.30)

    result.market_score = {
      score: clamp(composite, 0, 100),
      factors: {
        inventory: Math.round(invScore),
        dom:       Math.round(domScore),
        priceCuts: snap.price_cuts?.pct != null ? clamp(100 - snap.price_cuts.pct * 2, 0, 100) : 50,
        momentum:  Math.round(priceScore),
        demand:    Math.round((invScore + domScore) / 2),
      },
    }

    const sbScore = clamp(Math.round((invScore + domScore + priceScore) / 3), 0, 100)
    result.seller_buyer = {
      score:         sbScore,
      label:         sbLabel(sbScore),
      inventoryScore: Math.round(invScore),
      domScore:       Math.round(domScore),
      cutsScore:      snap.price_cuts?.pct != null ? clamp(100 - snap.price_cuts.pct * 2, 0, 100) : 50,
    }
  }

  // Cycle phase
  if (hasPriceYoy && hasInventory) {
    const invYoy = (inv.current - inv.yearAgo) / inv.yearAgo * 100
    const phase  = cyclePhase(hp.yoy, invYoy, dom?.current, dom?.yearAgo)
    result.cycle = { phase, monthsIn: snap.cycle?.monthsIn ?? 12 }
  }

  // Rough overvaluation proxy (no income data yet — rate environment as signal)
  if (hp?.median != null && hasPriceYoy) {
    const rateSpread = Math.max(0, rate30yr - 5.5)
    const ovPct = Math.round(Math.max(0, hp.yoy) * 2 + rateSpread * 3)
    result.overvaluation = {
      pct:     ovPct,
      status:  ovPct > 20 ? 'overvalued' : ovPct > 10 ? 'slightly overvalued' : 'fair value',
      fairValue: Math.round(hp.median / (1 + ovPct / 100)),
    }
  }

  // Price forecast score
  if (hasPriceYoy) {
    const score = clamp(Math.round(50 + hp.yoy * 3 - (rate30yr - 5) * 4 - fedFunds * 0.5), 0, 100)
    result.price_forecast_score = {
      score,
      grade: scoreGrade(score),
      trend: hp.yoy > 2 ? 'rising' : hp.yoy < -1 ? 'cooling' : 'stable',
    }
  }

  // Appreciation forecast (simple momentum extrapolation with mean reversion)
  if (hasPriceYoy) {
    const yr1 = +hp.yoy.toFixed(1)
    const yr3 = +(yr1 * 0.75).toFixed(1)
    const yr5 = +(yr1 * 0.60).toFixed(1)
    result.appreciation = { yr1, yr3, yr5 }
  }

  // Rent score
  if (snap.rent?.median != null && snap.rent?.yoyGrowth != null) {
    const rentGrowth = snap.rent.yoyGrowth
    const yieldEst   = snap.rent_score?.yield ?? 4.5
    const score      = clamp(Math.round(50 + rentGrowth * 4 + (yieldEst - 4) * 5), 0, 100)
    result.rent_score = {
      ...snap.rent_score,
      score,
      rentGrowth,
    }
  }

  return result
}
