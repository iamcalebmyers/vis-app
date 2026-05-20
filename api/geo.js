// GET /api/geo?id={geoId}
// Returns the data snapshot for a geography, plus the national snapshot for
// comparisons. Accepts both typed IDs (`zip:78701`) and legacy keys
// (`zip_78701`) for backward compat with Phase 1 localStorage values.
//
// Until Phase 4 wires real data, only the 5 mock-mapped geos return real
// content; all other typed IDs fall back to national mock data with a
// `sources.kind === 'mock-fallback'` flag so the UI can surface that.

import { geoData, historicalPrices } from '../src/data/geoData.js'
import { normalizeGeoId, MOCK_KEY_FOR } from './_lib/geoIds.js'
import { getEntryById } from './_lib/geoIndex.js'

function parentChain(entry) {
  if (!entry) return []
  const chain = []
  const ids = Object.values(entry.parents || {})
  for (const pid of ids) {
    const p = getEntryById(pid)
    if (p) chain.push({ id: p.id, type: p.type, label: p.label })
  }
  return chain
}

export default function handler(req, res) {
  const id        = normalizeGeoId(req.query?.id)
  const entry     = getEntryById(id)
  const mockKey   = MOCK_KEY_FOR[id]                 // 'metro_austin' etc., or undefined
  const hasMock   = !!mockKey && !!geoData[mockKey]

  const data      = hasMock ? geoData[mockKey]            : geoData.national
  const hist      = hasMock ? historicalPrices[mockKey]   : historicalPrices.national

  const payload = {
    id,
    label:    entry?.label || (id === 'national' ? '🇺🇸 United States' : id),
    type:     entry?.type  || 'national',
    parents:  parentChain(entry),
    data,
    national: geoData.national,
    historicalPrices: hist,
    asOf:    null,                                   // set once real sources wire in (Phase 3+)
    sources: hasMock
      ? { kind: 'mock' }
      : { kind: 'mock-fallback', requestedId: id, servedId: 'national' },
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
  res.status(200).json(payload)
}
