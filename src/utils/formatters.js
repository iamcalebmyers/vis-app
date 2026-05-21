const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Converts 'YYYY-MM', 'YYYY-MM-DD', or ISO timestamp to 'Apr 2026'
export function fmtMonth(raw) {
  if (!raw) return null
  const ym = String(raw).slice(0, 7)
  const [y, m] = ym.split('-')
  const idx = parseInt(m, 10) - 1
  return `${MONTHS[idx] || m} ${y}`
}

export const fmt = {
  currency: (v, compact = false) => {
    if (compact && v >= 1_000_000) return `$${(v/1_000_000).toFixed(1)}M`
    if (compact && v >= 1_000)    return `$${(v/1_000).toFixed(0)}K`
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
  },
  pct: (v, decimals = 1) => `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}%`,
  pctAbs: (v, decimals = 1) => `${Math.abs(v).toFixed(decimals)}%`,
  num: (v, compact = false) => {
    if (compact && v >= 1_000_000) return `${(v/1_000_000).toFixed(1)}M`
    if (compact && v >= 1_000)    return `${(v/1_000).toFixed(0)}K`
    return new Intl.NumberFormat('en-US').format(v)
  },
  days: (v) => `${v}d`,
  rate: (v) => `${v.toFixed(2)}%`,
  score: (v) => Math.round(v),
}

export function gradeFromScore(score) {
  if (score >= 95) return 'A+'
  if (score >= 90) return 'A'
  if (score >= 83) return 'B+'
  if (score >= 75) return 'B'
  if (score >= 68) return 'C+'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

export function scoreColor(score) {
  if (score >= 61) return 'var(--green)'
  if (score >= 36) return 'var(--yellow)'
  return 'var(--red)'
}

export function scoreLabel(score) {
  if (score >= 80) return 'Strong Growth'
  if (score >= 61) return 'Growth Likely'
  if (score >= 36) return 'Flat / Uncertain'
  return 'Declining Risk'
}

export function deltaColor(delta, invertPositive = false) {
  if (delta === 0) return 'var(--muted)'
  const positive = invertPositive ? delta < 0 : delta > 0
  return positive ? 'var(--green)' : 'var(--red)'
}

export function arrow(delta) {
  if (delta > 0) return '▲'
  if (delta < 0) return '▼'
  return '—'
}
