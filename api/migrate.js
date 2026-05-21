// One-time schema migration. Hit this endpoint once after connecting Neon
// to create the housing_snapshots table. Safe to run multiple times
// (uses CREATE TABLE IF NOT EXISTS).
//
// GET https://vis-app-seven.vercel.app/api/migrate

import { getDb, isDbAvailable } from './_lib/db.js'

export default async function handler(req, res) {
  if (!isDbAvailable()) {
    return res.status(500).json({ error: 'POSTGRES_URL not set — provision Neon first' })
  }

  const sql = getDb()

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS housing_snapshots (
        geo_id     TEXT        NOT NULL,
        metric     TEXT        NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        current    NUMERIC,
        year_ago   NUMERIC,
        history    JSONB,
        PRIMARY KEY (geo_id, metric)
      )
    `
    await sql`
      CREATE INDEX IF NOT EXISTS idx_hs_geo ON housing_snapshots (geo_id)
    `
    res.status(200).json({ ok: true, message: 'Schema ready — housing_snapshots table created.' })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}
