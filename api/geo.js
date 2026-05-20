// GET /api/geo?id={geoId}
// Returns the data snapshot for a geography, plus the national snapshot
// for cross-geo comparisons. Phase 1 serves mock data straight from the
// frontend's geoData module; later phases replace this with Postgres + KV.

import { geoData, historicalPrices } from '../src/data/geoData.js'
import { normalizeGeoId } from './_lib/geoIds.js'

export default function handler(req, res) {
  const id = normalizeGeoId(req.query?.id)

  const payload = {
    id,
    data: geoData[id],
    national: geoData.national,
    historicalPrices: historicalPrices[id] ?? historicalPrices.national,
    asOf: null,            // set once real sources are wired (Phase 3+)
    sources: { kind: 'mock' },
  }

  // 5 min CDN cache; mock data is static so this is generous
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
  res.status(200).json(payload)
}
