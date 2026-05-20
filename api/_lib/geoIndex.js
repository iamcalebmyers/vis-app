// Loads api/_data/geo_index.json once into module scope. Reused across warm
// Lambda invocations so subsequent requests are sub-10ms.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const INDEX_PATH = join(__dirname, '..', '_data', 'geo_index.json')

let _cache = null

export function getGeoIndex() {
  if (_cache) return _cache
  const raw = readFileSync(INDEX_PATH, 'utf8')
  _cache = JSON.parse(raw)
  // Build a Map for O(1) id → entry lookups
  _cache.byId = new Map(_cache.entries.map(e => [e.id, e]))
  return _cache
}

export function getEntryById(id) {
  return getGeoIndex().byId.get(id) || null
}
