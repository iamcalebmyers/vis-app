// GET /api/geo?id={geoId}
// Returns the data snapshot for a geography, plus the national snapshot for
// comparisons. Accepts both typed IDs (`zip:78701`) and legacy keys
// (`zip_78701`) for backward compat with Phase 1 localStorage values.
//
// Phase 3+: live macro/rate values from KV are overlaid onto the mock
// snapshot so widgets like Rate30yr show real values even before Phase 4
// wires ZIP-level housing data.

import { geoData, historicalPrices } from '../src/data/geoData.js'
import { normalizeGeoId, MOCK_KEY_FOR } from './_lib/geoIds.js'
import { getEntryById } from './_lib/geoIndex.js'
import { kvMGet } from './_lib/kv.js'

const MACRO_KEYS = [
  'macro:rate30yr',
  'macro:rate15yr',
  'macro:treasury10yr',
  'macro:fedFunds',
  'macro:cpi',
  'macro:unemployment',
  'macro:meta',
]

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

// Overlay live macro values onto a (cloned) snapshot in-place.
// Returns the same snapshot for convenience.
function overlayMacro(snapshot, macro) {
  if (!snapshot) return snapshot
  const r30 = macro['macro:rate30yr']
  const r15 = macro['macro:rate15yr']
  if (r30 && r30.value != null) {
    snapshot.rate_30yr = {
      ...snapshot.rate_30yr,
      rate:        r30.value,
      weekChange:  r30.weekChange ?? snapshot.rate_30yr?.weekChange ?? 0,
      rate15:      r15?.value ?? snapshot.rate_30yr?.rate15,
      asOf:        r30.asOf,
      source:      r30.source,
    }
  }
  return snapshot
}

export default async function handler(req, res) {
  const id        = normalizeGeoId(req.query?.id)
  const entry     = getEntryById(id)
  const mockKey   = MOCK_KEY_FOR[id]
  const hasMock   = !!mockKey && !!geoData[mockKey]

  // Clone so we don't mutate the imported mock objects across requests
  const data     = hasMock ? structuredClone(geoData[mockKey])    : structuredClone(geoData.national)
  const national = structuredClone(geoData.national)
  const hist     = hasMock ? historicalPrices[mockKey]   : historicalPrices.national

  // Pull live macro values from KV (no-ops if KV not yet provisioned)
  const macro = await kvMGet(MACRO_KEYS)
  overlayMacro(data, macro)
  overlayMacro(national, macro)

  const macroBlock = {
    rate30yr:     macro['macro:rate30yr']     || null,
    rate15yr:     macro['macro:rate15yr']     || null,
    treasury10yr: macro['macro:treasury10yr'] || null,
    fedFunds:     macro['macro:fedFunds']     || null,
    cpi:          macro['macro:cpi']          || null,
    unemployment: macro['macro:unemployment'] || null,
    meta:         macro['macro:meta']         || null,
  }
  const anyMacroLive = Object.values(macroBlock).some(v => v && v.value != null)

  const payload = {
    id,
    label:    entry?.label || (id === 'national' ? '🇺🇸 United States' : id),
    type:     entry?.type  || 'national',
    parents:  parentChain(entry),
    data,
    national,
    historicalPrices: hist,
    macro:    macroBlock,
    asOf:     macroBlock.meta?.completedAt || null,
    sources:  hasMock
      ? { kind: 'mock', macro: anyMacroLive ? 'live' : 'mock' }
      : { kind: 'mock-fallback', requestedId: id, servedId: 'national', macro: anyMacroLive ? 'live' : 'mock' },
  }

  // Short edge cache. KV reads are fast, but trimming repeated hits.
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  res.status(200).json(payload)
}
