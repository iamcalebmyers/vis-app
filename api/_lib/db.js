// Neon serverless Postgres client.
// `neon()` returns a tagged-template SQL function — use it for simple queries
// in request handlers. `getPool()` returns a pg-compatible Pool — use it for
// bulk inserts in cron jobs where you need transactions and multi-row VALUES.
//
// Both are no-ops (throw gracefully) when POSTGRES_URL is not set.

import { neon } from '@neondatabase/serverless'
import { Pool } from '@neondatabase/serverless'

let _sql = null

export function getDb() {
  if (_sql) return _sql
  const url = process.env.POSTGRES_URL
  if (!url) throw new Error('POSTGRES_URL not set')
  _sql = neon(url)
  return _sql
}

export function getPool() {
  const url = process.env.POSTGRES_URL
  if (!url) throw new Error('POSTGRES_URL not set')
  return new Pool({ connectionString: url })
}

export function isDbAvailable() {
  return !!process.env.POSTGRES_URL
}
