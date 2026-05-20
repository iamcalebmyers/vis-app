// Daily cron at 06:00 UTC. Pulls macro/rate series from FRED and writes
// the latest values to KV so /api/geo can merge them into snapshots.
//
// Schedule lives in vercel.json. Vercel sends a Bearer auth header with
// the CRON_SECRET env var on each invocation — we verify it here so
// nobody else can trigger expensive fetches.
//
// Run manually:
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//     https://vis-app-seven.vercel.app/api/cron/rates

import { fetchLatest, FRED_SERIES } from '../_lib/fred.js'
import { kvSet, isKvAvailable } from '../_lib/kv.js'

const KV_KEYS = {
  rate30yr:     'macro:rate30yr',
  rate15yr:     'macro:rate15yr',
  treasury10yr: 'macro:treasury10yr',
  fedFunds:     'macro:fedFunds',
  cpi:          'macro:cpi',
  unemployment: 'macro:unemployment',
  meta:         'macro:meta',
}

function authorized(req) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically
  // when CRON_SECRET is set as an env var. Skip the check if no secret is
  // set (e.g. first run before configuration).
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  const got = req.headers?.authorization || ''
  return got === `Bearer ${secret}`
}

export default async function handler(req, res) {
  if (!authorized(req)) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  if (!process.env.FRED_API_KEY) {
    return res.status(500).json({ error: 'FRED_API_KEY not set' })
  }
  if (!isKvAvailable()) {
    return res.status(500).json({ error: 'KV not provisioned' })
  }

  const startedAt = new Date().toISOString()
  const results   = {}
  const errors    = {}

  // Fetch each FRED series in parallel
  await Promise.all(
    Object.entries(FRED_SERIES).map(async ([name, seriesId]) => {
      try {
        const latest = await fetchLatest(seriesId)
        if (latest) {
          await kvSet(KV_KEYS[name], latest)
          results[name] = latest
        } else {
          errors[name] = 'no observations returned'
        }
      } catch (err) {
        errors[name] = err.message
      }
    })
  )

  const meta = {
    lastRunAt:  startedAt,
    completedAt: new Date().toISOString(),
    fetched:    Object.keys(results),
    failed:     Object.keys(errors),
  }
  await kvSet(KV_KEYS.meta, meta)

  res.status(Object.keys(errors).length ? 207 : 200).json({
    ok: Object.keys(errors).length === 0,
    meta,
    results,
    errors,
  })
}
