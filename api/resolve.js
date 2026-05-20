// GET /api/resolve?q={query}&limit=10
// Fuzzy-searches the geo index and returns matches ranked by relevance,
// boosted by type priority (state > metro > county > zip) so short queries
// surface high-level geos first.

import fuzzysort from 'fuzzysort'
import { getGeoIndex } from './_lib/geoIndex.js'

const DEFAULT_LIMIT = 10
const MAX_LIMIT     = 25

// Higher = more relevant
const TYPE_BOOST = { national: 1000, state: 800, metro: 500, county: 200, zip: 0 }

let _prepared = null

function preparedEntries() {
  if (_prepared) return _prepared
  const { entries } = getGeoIndex()
  _prepared = entries.map(e => ({
    ...e,
    _searchKey: fuzzysort.prepare(e.searchTerms),
  }))
  return _prepared
}

export default function handler(req, res) {
  const q     = String(req.query?.q ?? '').trim().toLowerCase()
  const limit = Math.min(Number(req.query?.limit) || DEFAULT_LIMIT, MAX_LIMIT)

  if (!q || q.length < 2) {
    res.setHeader('Cache-Control', 'public, max-age=60')
    return res.status(200).json({ q, results: [] })
  }

  // No internal limit — fuzzysort is fast enough on 45k candidates that we
  // can re-rank with the type boost across the entire match set.
  const candidates = preparedEntries()
  const results = fuzzysort
    .go(q, candidates, { key: '_searchKey', threshold: -10000 })
    .map(r => ({
      score: r.score + TYPE_BOOST[r.obj.type],
      entry: r.obj,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => ({
      id:      entry.id,
      type:    entry.type,
      label:   entry.label,
      parents: entry.parents,
    }))

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  res.status(200).json({ q, results })
}
