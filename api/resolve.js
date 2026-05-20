// GET /api/resolve?q={query}&limit=10
// Fuzzy-searches the geo index and returns matches ranked by relevance,
// boosted by type priority (state > metro > county > zip) so short queries
// surface high-level geos first.

import fuzzysort from 'fuzzysort'
import { getGeoIndex } from './_lib/geoIndex.js'

const DEFAULT_LIMIT = 10
const MAX_LIMIT     = 25

// fuzzysort v3 returns scores in [0, 1] — 1.0 perfect, ~0.7+ strong,
// ~0.3 fuzzy, ~0 noise. Boosts intentionally large enough to push the
// metro for a city above the city's own ZIPs (which all score similarly).
const TYPE_BOOST = { national: 0.05, state: 0.20, metro: 0.15, county: 0.05, zip: 0 }
// Drop fuzzy noise — anything below this score isn't surfaced.
const SCORE_THRESHOLD = 0.35

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
    .go(q, candidates, { key: '_searchKey', threshold: SCORE_THRESHOLD })
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
