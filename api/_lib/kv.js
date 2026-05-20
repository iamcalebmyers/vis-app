// Thin wrapper around @upstash/redis. Vercel auto-injects the credentials
// when you provision Upstash via the Storage tab.
//
// All methods are no-ops when env vars are missing so the rest of the API
// keeps working before Upstash is provisioned (kvGet returns null, kvSet
// returns false). Once env vars land, everything wires up automatically.

import { Redis } from '@upstash/redis'

let _client = null

function getClient() {
  if (_client) return _client
  const url   = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  _client = new Redis({ url, token })
  return _client
}

export function isKvAvailable() {
  return !!getClient()
}

export async function kvGet(key) {
  const c = getClient()
  if (!c) return null
  try {
    return await c.get(key)
  } catch (err) {
    console.error(`[kv] GET ${key} failed:`, err.message)
    return null
  }
}

// Returns true on success. Pass an object to store as JSON.
export async function kvSet(key, value, opts = {}) {
  const c = getClient()
  if (!c) return false
  try {
    if (opts.ex) {
      await c.set(key, value, { ex: opts.ex })
    } else {
      await c.set(key, value)
    }
    return true
  } catch (err) {
    console.error(`[kv] SET ${key} failed:`, err.message)
    return false
  }
}

// Batch GET — returns an object keyed by the input keys
export async function kvMGet(keys) {
  const c = getClient()
  if (!c) return Object.fromEntries(keys.map(k => [k, null]))
  try {
    const vals = await c.mget(...keys)
    return Object.fromEntries(keys.map((k, i) => [k, vals[i]]))
  } catch (err) {
    console.error(`[kv] MGET failed:`, err.message)
    return Object.fromEntries(keys.map(k => [k, null]))
  }
}
