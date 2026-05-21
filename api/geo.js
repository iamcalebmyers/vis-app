// GET /api/geo?id={geoId}
// Returns the data snapshot for a geography, plus the national snapshot for
// comparisons. Accepts both typed IDs (`zip:78701`) and legacy keys
// (`zip_78701`) for backward compat with Phase 1 localStorage values.
//
// Phase 3: live macro/rate values from KV are overlaid.
// Phase 4: live housing data (home price, inventory, DOM, rent) from Postgres
//          is overlaid. Cascades ZIP → county → metro → state if the
//          requested ZIP has no Zillow coverage.

import { geoData, historicalPrices } from '../src/data/geoData.js'
import { normalizeGeoId, MOCK_KEY_FOR } from './_lib/geoIds.js'
import { getEntryById } from './_lib/geoIndex.js'
import { kvMGet } from './_lib/kv.js'
import { getDb, isDbAvailable } from './_lib/db.js'
import { cascadeGet } from './_lib/cascade.js'
import { computeDerivedFields } from './_lib/algorithms.js'

const MACRO_KEYS = [
  'macro:rate30yr',
  'macro:rate15yr',
  'macro:treasury10yr',
  'macro:fedFunds',
  'macro:cpi',
  'macro:unemployment',
  'macro:meta',
]

const HOUSING_METRICS = ['zhvi', 'zori', 'inventory', 'dom', 'median_sale_price']

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

function overlayMacro(snapshot, macro) {
  if (!snapshot) return snapshot
  const r30 = macro['macro:rate30yr']
  const r15 = macro['macro:rate15yr']
  if (r30 && r30.value != null) {
    snapshot.rate_30yr = {
      ...snapshot.rate_30yr,
      rate:       r30.value,
      weekChange: r30.weekChange ?? snapshot.rate_30yr?.weekChange ?? 0,
      rate15:     r15?.value ?? snapshot.rate_30yr?.rate15,
      asOf:       r30.asOf,
      source:     r30.source,
    }
  }
  return snapshot
}

// Merges Postgres housing_snapshots rows into the data snapshot (in-place).
function overlayLiveHousing(data, rows) {
  const byMetric = {}
  for (const row of rows) byMetric[row.metric] = row

  const zhvi = byMetric.zhvi
  const zori = byMetric.zori
  const inv  = byMetric.inventory
  const dom  = byMetric.dom
  const msp  = byMetric.median_sale_price

  if (zhvi?.current != null) {
    const yoy = zhvi.year_ago
      ? +((zhvi.current - zhvi.year_ago) / zhvi.year_ago * 100).toFixed(1)
      : (data.home_price?.yoy ?? null)
    data.home_price = { ...data.home_price, median: Math.round(zhvi.current), yoy }
  }

  if (inv?.current != null) {
    data.inventory = {
      ...data.inventory,
      current: Math.round(inv.current),
      yearAgo: inv.year_ago != null ? Math.round(inv.year_ago) : data.inventory?.yearAgo,
    }
  }

  if (dom?.current != null) {
    data.dom = {
      ...data.dom,
      current: Math.round(dom.current),
      yearAgo: dom.year_ago != null ? Math.round(dom.year_ago) : data.dom?.yearAgo,
    }
  }

  if (zori?.current != null) {
    const rentYoy = zori.year_ago
      ? +((zori.current - zori.year_ago) / zori.year_ago * 100).toFixed(1)
      : (data.rent?.yoyGrowth ?? null)
    data.rent = { ...data.rent, median: Math.round(zori.current), yoyGrowth: rentYoy }
  }

  if (msp?.current != null) {
    data.home_price = { ...data.home_price, medianSalePrice: Math.round(msp.current) }
  }
}

export default async function handler(req, res) {
  const id      = normalizeGeoId(req.query?.id)
  const entry   = getEntryById(id)
  const mockKey = MOCK_KEY_FOR[id]
  const hasMock = !!mockKey && !!geoData[mockKey]

  // Clone so we don't mutate the imported mock objects across requests
  const data     = hasMock ? structuredClone(geoData[mockKey]) : structuredClone(geoData.national)
  const national = structuredClone(geoData.national)
  let hist       = hasMock ? historicalPrices[mockKey] : historicalPrices.national

  // Pull live macro from KV
  const macro = await kvMGet(MACRO_KEYS)

  // Build macroBlock early — needed by computeDerivedFields
  const macroBlock = {
    rate30yr:     macro['macro:rate30yr']     || null,
    rate15yr:     macro['macro:rate15yr']     || null,
    treasury10yr: macro['macro:treasury10yr'] || null,
    fedFunds:     macro['macro:fedFunds']     || null,
    cpi:          macro['macro:cpi']          || null,
    unemployment: macro['macro:unemployment'] || null,
    meta:         macro['macro:meta']         || null,
  }

  overlayMacro(data, macro)
  overlayMacro(national, macro)

  // Pull live housing data from Postgres (no-op if not yet provisioned)
  let housingSourceId = id
  let housingCascaded = false
  let liveHousingAsOf = null
  let anyHousingLive  = false

  if (isDbAvailable()) {
    try {
      const sql = getDb()
      const { rows, sourceGeoId, cascaded } = await cascadeGet(sql, id, HOUSING_METRICS)

      if (rows.length > 0) {
        anyHousingLive  = true
        housingSourceId = sourceGeoId
        housingCascaded = cascaded

        overlayLiveHousing(data, rows)

        // Build historicalPrices from ZHVI history (36 months of real data)
        const zhviRow = rows.find(r => r.metric === 'zhvi')
        const zhviHistory = Array.isArray(zhviRow?.history) ? zhviRow.history : []
        if (zhviHistory.length > 0) {
          hist = zhviHistory.map(h => ({ date: h.date, price: Math.round(h.value) }))
          liveHousingAsOf = zhviHistory[zhviHistory.length - 1]?.date
        }

        // Compute derived scores from real data
        const derived = computeDerivedFields(data, macroBlock)
        Object.assign(data, derived)
      }
    } catch (err) {
      // DB errors fall through to mock data — dashboard stays functional
      console.error('[geo] DB error:', err.message)
    }
  }

  const anyMacroLive = Object.values(macroBlock).some(v => v && v.value != null)

  const payload = {
    id,
    label:   entry?.label || (id === 'national' ? '🇺🇸 United States' : id),
    type:    entry?.type  || 'national',
    parents: parentChain(entry),
    data,
    national,
    historicalPrices: hist,
    macro:   macroBlock,
    asOf:    liveHousingAsOf || macroBlock.meta?.completedAt || null,
    sources: {
      kind:        anyHousingLive ? 'live' : (hasMock ? 'mock' : 'mock-fallback'),
      housing:     anyHousingLive ? 'live' : 'mock',
      housingGeo:  housingCascaded ? housingSourceId : null,
      macro:       anyMacroLive ? 'live' : 'mock',
      requestedId: id,
      servedId:    hasMock ? id : 'national',
    },
  }

  // Short edge cache — KV and DB reads are fast but trim repeated hits
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  res.status(200).json(payload)
}
