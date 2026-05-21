// Zillow Research CSV downloader and parser.
//
// Zillow publishes free bulk CSVs at https://www.zillow.com/research/data/
// File paths are stable but occasionally change — verify against the research
// page if a cron run reports 404s.
//
// Each CSV has ~9 metadata columns followed by monthly date columns (YYYY-MM-DD).
// We pull the last 37 months: 36 for history + 1 extra to compute year-ago from
// the oldest history entry.

const BASE = 'https://files.zillowstatic.com/research/public_csvs'

// Zillow renamed two feeds in 2024:
//   ZORI: now lowercase `zori` + seasonally adjusted variant
//   "Days on Market" → "Median Days on Zillow before Pending" (med_doz_pending)
export const FEEDS = {
  zhvi:              `${BASE}/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv`,
  zori:              `${BASE}/zori/Zip_zori_uc_sfrcondomfr_sm_sa_month.csv`,
  inventory:         `${BASE}/invt_fs/Zip_invt_fs_uc_sfrcondo_sm_month.csv`,
  dom:               `${BASE}/med_doz_pending/Zip_med_doz_pending_uc_sfrcondo_sm_month.csv`,
  median_sale_price: `${BASE}/median_sale_price/Zip_median_sale_price_uc_sfrcondo_sm_month.csv`,
}

function parseLine(line) {
  const result = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      quoted = !quoted
    } else if (c === ',' && !quoted) {
      result.push(cell)
      cell = ''
    } else {
      cell += c
    }
  }
  result.push(cell)
  return result
}

// Downloads a ZIP-level Zillow CSV and returns an array of:
//   { geoId: 'zip:78701', current: N, yearAgo: N, history: [{date:'YYYY-MM', value:N}] }
// Rows with no valid values are skipped.
export async function fetchZillowZip(url) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'vis-app/1.0' },
  })
  if (!r.ok) throw new Error(`Zillow CSV ${url} returned ${r.status}`)
  const text = await r.text()

  const lines = text.split('\n')
  const headers = parseLine(lines[0])

  const regionNameIdx = headers.indexOf('RegionName')
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
  const allDateIndices = headers.reduce((acc, h, i) => {
    if (DATE_RE.test(h)) acc.push(i)
    return acc
  }, [])

  // Keep last 37 months (36 history + buffer for year-ago)
  const wantedIndices = allDateIndices.slice(-37)
  const wantedDates   = wantedIndices.map(i => headers[i].slice(0, 7)) // YYYY-MM

  const rows = []
  for (let li = 1; li < lines.length; li++) {
    const line = lines[li]
    if (!line.trim()) continue

    const cols = parseLine(line)
    const zip  = cols[regionNameIdx]?.trim()
    // ZIP codes are 1–5 digits; pad to 5
    if (!zip || !/^\d{1,5}$/.test(zip)) continue

    const geoId = `zip:${zip.padStart(5, '0')}`

    const history = []
    for (let j = 0; j < wantedIndices.length; j++) {
      const v = parseFloat(cols[wantedIndices[j]])
      if (!isNaN(v) && v > 0) {
        history.push({ date: wantedDates[j], value: Math.round(v * 100) / 100 })
      }
    }

    if (history.length < 2) continue

    const current  = history[history.length - 1].value
    const yearAgo  = history.length >= 13
      ? history[history.length - 13].value
      : history[0].value

    rows.push({ geoId, current, yearAgo, history })
  }

  return rows
}
