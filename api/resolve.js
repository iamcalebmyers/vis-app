// GET /api/resolve?q={query}&limit=10
// Fuzzy-searches the geo index and returns matches ranked by relevance,
// boosted by type priority (state > metro > county > zip) so short queries
// surface high-level geos first.

import fuzzysort from 'fuzzysort'
import { getGeoIndex } from './_lib/geoIndex.js'

const DEFAULT_LIMIT = 10
const MAX_LIMIT     = 25

// Small additive tie-breakers — type as the deciding signal only when
// fuzzy scores are close. National is excluded; users have to actually
// type "us"/"national" to surface it (and it'll match via fuzzysort).
const TYPE_BOOST = { national: 0, state: 50, metro: 30, county: 15, zip: 0 }
// Threshold below which matches are dropped as too weak. fuzzysort 3.x
// scores ~0 for perfect, -10 to -100 for good fuzzy, much lower for noise.
const SCORE_THRESHOLD = -1000

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
