// Monthly cron at 07:00 UTC on the 15th. Downloads Zillow Research CSVs and
// upserts ZIP-level housing snapshots into Postgres.
//
// Schedule lives in vercel.json. Protected by CRON_SECRET (same as rates.js).
//
// Run manually:
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//     https://vis-app-seven.vercel.app/api/cron/housing
//
// First-time setup: hit /api/migrate to create the housing_snapshots table
// before triggering this cron.

import { getPool, isDbAvailable } from '../_lib/db.js'
import { fetchZillowZip, FEEDS } from '../_lib/zillow.js'

function authorized(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return (req.headers?.authorization || '') === `Bearer ${secret}`
}

// Bulk upsert in chunks of 500 rows using parameterized multi-row INSERT.
async function upsertRows(client, rows, metric) {
  const CHUNK = 500
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const placeholders = []
    const params = []
    let p = 1
    for (const row of chunk) {
      placeholders.push(`($${p++}, $${p++}, $${p++}, $${p++}, $${p++}::jsonb)`)
      params.push(row.geoId, metric, row.current, row.yearAgo, JSON.stringify(row.history))
    }
    await client.query(
      `INSERT INTO housing_snapshots (geo_id, metric, current, year_ago, history)
       VALUES ${placeholders.join(',')}
       ON CONFLICT (geo_id, metric) DO UPDATE SET
         current    = EXCLUDED.current,
         year_ago   = EXCLUDED.year_ago,
         history    = EXCLUDED.history,
         updated_at = now()`,
      params
    )
  }
}

export default async function handler(req, res) {
  if (!authorized(req)) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  if (!isDbAvailable()) {
    return res.status(500).json({ error: 'POSTGRES_URL not set — provision Neon first' })
  }

  const startedAt = new Date().toISOString()
  const results = {}
  const errors  = {}

  const pool   = getPool()
  const client = await pool.connect()

  try {
    for (const [metric, url] of Object.entries(FEEDS)) {
      try {
        const rows = await fetchZillowZip(url)
        await upsertRows(client, rows, metric)
        results[metric] = rows.length
      } catch (err) {
        errors[metric] = err.message
      }
    }
  } finally {
    client.release()
    await pool.end()
  }

  res.status(Object.keys(errors).length ? 207 : 200).json({
    ok:          Object.keys(errors).length === 0,
    startedAt,
    completedAt: new Date().toISOString(),
    results,
    errors,
  })
}
