// Zillow Research CSV downloader and parser.
//
// Zillow publishes free bulk CSVs at https://www.zillow.com/research/data/
// File paths are stable but occasionally change — verify against the research
// page if a cron run reports 404s.
//
// Each CSV has ~9 metadata columns followed by monthly date columns (YYYY-MM-DD).
// We pull the last 37 months: 36 for history + 1 extra to compute year-ago from
// the oldest history entry.
//
// Coverage levels:
//   ZIP    → zip:XXXXX               (33k geos, full feed coverage)
//   State  → state:XX                (51 geos, no ZORI feed)
//   National → 'national'            (sourced from Metro CSV's "United States" row)
// Metro/County not ingested yet — would require Zillow-name → CBSA matching.

const BASE = 'https://files.zillowstatic.com/research/public_csvs'

// ZIP-level feeds (used by Phase 4 ingest)
export const ZIP_FEEDS = {
  zhvi:              `${BASE}/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv`,
  zori:              `${BASE}/zori/Zip_zori_uc_sfrcondomfr_sm_sa_month.csv`,
  inventory:         `${BASE}/invt_fs/Zip_invt_fs_uc_sfrcondo_sm_month.csv`,
  dom:               `${BASE}/med_doz_pending/Zip_med_doz_pending_uc_sfrcondo_sm_month.csv`,
  median_sale_price: `${BASE}/median_sale_price/Zip_median_sale_price_uc_sfrcondo_sm_month.csv`,
}

// State-level feeds (no ZORI publishd at this level)
export const STATE_FEEDS = {
  zhvi:              `${BASE}/zhvi/State_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv`,
  inventory:         `${BASE}/invt_fs/State_invt_fs_uc_sfrcondo_sm_month.csv`,
  dom:               `${BASE}/med_doz_pending/State_med_doz_pending_uc_sfrcondo_sm_month.csv`,
  median_sale_price: `${BASE}/median_sale_price/State_median_sale_price_uc_sfrcondo_sm_month.csv`,
}

// Metro feeds — used to extract the "United States" national row.
// Full metro ingest deferred until Zillow-name → CBSA matching is built.
export const METRO_FEEDS = {
  zhvi:              `${BASE}/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv`,
  zori:              `${BASE}/zori/Metro_zori_uc_sfrcondomfr_sm_sa_month.csv`,
  inventory:         `${BASE}/invt_fs/Metro_invt_fs_uc_sfrcondo_sm_month.csv`,
  dom:               `${BASE}/med_doz_pending/Metro_med_doz_pending_uc_sfrcondo_sm_month.csv`,
  median_sale_price: `${BASE}/median_sale_price/Metro_median_sale_price_uc_sfrcondo_sm_month.csv`,
}

// Back-compat: callers in Phase 4 cron import { FEEDS }
export const FEEDS = ZIP_FEEDS

const STATE_NAME_TO_ABBR = {
  'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA',
  'Colorado':'CO','Connecticut':'CT','Delaware':'DE','District of Columbia':'DC',
  'Florida':'FL','Georgia':'GA','Hawaii':'HI','Idaho':'ID','Illinois':'IL',
  'Indiana':'IN','Iowa':'IA','Kansas':'KS','Kentucky':'KY','Louisiana':'LA',
  'Maine':'ME','Maryland':'MD','Massachusetts':'MA','Michigan':'MI','Minnesota':'MN',
  'Mississippi':'MS','Missouri':'MO','Montana':'MT','Nebraska':'NE','Nevada':'NV',
  'New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','New York':'NY',
  'North Carolina':'NC','North Dakota':'ND','Ohio':'OH','Oklahoma':'OK','Oregon':'OR',
  'Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD',
  'Tennessee':'TN','Texas':'TX','Utah':'UT','Vermont':'VT','Virginia':'VA',
  'Washington':'WA','West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY',
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

// Generic CSV fetch + parse. `mapRow` receives (regionName, cols, headers)
// and returns a geo_id string or null to skip the row.
async function fetchZillowCsv(url, mapRow) {
  const r = await fetch(url, { headers: { 'User-Agent': 'vis-app/1.0' } })
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
  const wantedDates   = wantedIndices.map(i => headers[i].slice(0, 7))

  const rows = []
  for (let li = 1; li < lines.length; li++) {
    const line = lines[li]
    if (!line.trim()) continue

    const cols = parseLine(line)
    const regionName = cols[regionNameIdx]?.trim()
    if (!regionName) continue

    const geoId = mapRow(regionName, cols, headers)
    if (!geoId) continue

    const history = []
    for (let j = 0; j < wantedIndices.length; j++) {
      const v = parseFloat(cols[wantedIndices[j]])
      if (!isNaN(v) && v > 0) {
        history.push({ date: wantedDates[j], value: Math.round(v * 100) / 100 })
      }
    }
    if (history.length < 2) continue

    const current = history[history.length - 1].value
    const yearAgo = history.length >= 13
      ? history[history.length - 13].value
      : history[0].value

    rows.push({ geoId, current, yearAgo, history })
  }

  return rows
}

export function fetchZillowZip(url) {
  return fetchZillowCsv(url, name => {
    if (!/^\d{1,5}$/.test(name)) return null
    return `zip:${name.padStart(5, '0')}`
  })
}

export function fetchZillowState(url) {
  return fetchZillowCsv(url, name => {
    const abbr = STATE_NAME_TO_ABBR[name]
    return abbr ? `state:${abbr}` : null
  })
}

// Extracts only the "United States" national row from a Metro-level CSV.
export function fetchZillowNational(url) {
  return fetchZillowCsv(url, name => name === 'United States' ? 'national' : null)
}
