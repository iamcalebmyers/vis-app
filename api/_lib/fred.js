// Thin wrapper around the FRED API (https://fred.stlouisfed.org/docs/api/).
// Requires FRED_API_KEY env var. Each series is fetched independently and
// cached briefly to avoid burning quota during a single cron run.

const BASE = 'https://api.stlouisfed.org/fred/series/observations'

// Series IDs we use across widgets:
export const FRED_SERIES = {
  rate30yr:     'MORTGAGE30US',
  rate15yr:     'MORTGAGE15US',
  treasury10yr: 'DGS10',
  fedFunds:     'FEDFUNDS',
  cpi:          'CPIAUCSL',
  unemployment: 'UNRATE',
}

function key() {
  const k = process.env.FRED_API_KEY
  if (!k) throw new Error('FRED_API_KEY env var not set')
  return k
}

// Fetch the most recent N observations for a series.
// Returns [{ date: 'YYYY-MM-DD', value: number }, ...] newest first.
export async function fetchSeries(seriesId, { limit = 8 } = {}) {
  const url = new URL(BASE)
  url.searchParams.set('series_id', seriesId)
  url.searchParams.set('api_key', key())
  url.searchParams.set('file_type', 'json')
  url.searchParams.set('sort_order', 'desc')
  url.searchParams.set('limit', String(limit))

  const r = await fetch(url, { headers: { 'User-Agent': 'vis-app/1.0' } })
  if (!r.ok) throw new Error(`FRED ${seriesId} returned ${r.status}`)
  const json = await r.json()

  return (json.observations || [])
    .map(o => ({ date: o.date, value: o.value === '.' ? null : Number(o.value) }))
    .filter(o => o.value !== null)
}

// Convenience: latest observation + week-over-week change.
export async function fetchLatest(seriesId) {
  const obs = await fetchSeries(seriesId, { limit: 8 })
  if (!obs.length) return null
  const latest = obs[0]
  const prev   = obs[1]
  return {
    value:      latest.value,
    asOf:       latest.date,
    weekChange: prev ? +(latest.value - prev.value).toFixed(3) : 0,
    source:     `FRED:${seriesId}`,
  }
}

// CPI index level isn't meaningful to users; YoY % change is. Fetches 14
// months of history and computes the current YoY rate.
export async function fetchCpiYoy() {
  const obs = await fetchSeries('CPIAUCSL', { limit: 14 })
  if (obs.length < 13) return null
  const latest = obs[0]
  const yearAgo = obs[12]
  const yoyPct = ((latest.value - yearAgo.value) / yearAgo.value) * 100
  return {
    value:  +yoyPct.toFixed(2),         // e.g. 3.21
    asOf:   latest.date,
    raw:    latest.value,               // raw CPI index level
    source: 'FRED:CPIAUCSL',
  }
}
