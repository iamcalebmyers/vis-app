// Builds api/_data/geo_index.json from Census Gazetteer files + the `zipcodes`
// npm package. Run once with `node scripts/build_geo_index.js`; the output is
// committed to the repo and consumed at runtime by api/resolve.js and api/geo.js.
//
// Sources:
// - Census Gazetteer (states, counties, CBSAs): https://www2.census.gov/geo/docs/maps-data/data/gazetteer/
// - `zipcodes` npm package (all US ZIPs with city/state/lat/lng)

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import zipcodes from 'zipcodes'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
const OUT_PATH  = join(REPO_ROOT, 'api', '_data', 'geo_index.json')
const TMP_DIR   = '/tmp/vis-geo-build'

const YEAR = 2024  // bump when Census publishes a newer Gazetteer vintage
const BASE = `https://www2.census.gov/geo/docs/maps-data/data/gazetteer/${YEAR}_Gazetteer`

const FILES = {
  states:   `${YEAR}_Gaz_state_national.zip`,
  counties: `${YEAR}_Gaz_counties_national.zip`,
  cbsas:    `${YEAR}_Gaz_cbsa_national.zip`,
}

// State name lookup — Gazetteer state file gives us this but easier to hardcode
// once for label formatting.
const STATE_NAMES = {
  AL:'Alabama', AK:'Alaska', AZ:'Arizona', AR:'Arkansas', CA:'California',
  CO:'Colorado', CT:'Connecticut', DE:'Delaware', FL:'Florida', GA:'Georgia',
  HI:'Hawaii', ID:'Idaho', IL:'Illinois', IN:'Indiana', IA:'Iowa', KS:'Kansas',
  KY:'Kentucky', LA:'Louisiana', ME:'Maine', MD:'Maryland', MA:'Massachusetts',
  MI:'Michigan', MN:'Minnesota', MS:'Mississippi', MO:'Missouri', MT:'Montana',
  NE:'Nebraska', NV:'Nevada', NH:'New Hampshire', NJ:'New Jersey', NM:'New Mexico',
  NY:'New York', NC:'North Carolina', ND:'North Dakota', OH:'Ohio', OK:'Oklahoma',
  OR:'Oregon', PA:'Pennsylvania', RI:'Rhode Island', SC:'South Carolina',
  SD:'South Dakota', TN:'Tennessee', TX:'Texas', UT:'Utah', VT:'Vermont',
  VA:'Virginia', WA:'Washington', WV:'West Virginia', WI:'Wisconsin', WY:'Wyoming',
  DC:'District of Columbia', PR:'Puerto Rico',
}

function download(name) {
  mkdirSync(TMP_DIR, { recursive: true })
  const zipPath = join(TMP_DIR, FILES[name])
  if (!existsSync(zipPath)) {
    console.log(`↓ downloading ${FILES[name]}`)
    execSync(`curl -sSL -o "${zipPath}" "${BASE}/${FILES[name]}"`, { stdio: 'inherit' })
  }
  console.log(`✂ unzipping ${FILES[name]}`)
  execSync(`unzip -oq "${zipPath}" -d "${TMP_DIR}"`, { stdio: 'inherit' })
  // Census Gazetteer ZIPs contain a .txt file named like 2024_Gaz_state_national.txt
  return join(TMP_DIR, FILES[name].replace('.zip', '.txt'))
}

function parseTSV(path) {
  const raw = readFileSync(path, 'utf8')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  const headers = lines[0].split('\t').map(h => h.trim())
  return lines.slice(1).map(line => {
    const cols = line.split('\t').map(c => c.trim())
    return Object.fromEntries(headers.map((h, i) => [h, cols[i]]))
  })
}

function buildEntries() {
  const entries = []

  // 1) National
  entries.push({
    id:          'national',
    type:        'national',
    label:       '🇺🇸 United States',
    searchTerms: 'us usa united states national america',
    parents:     {},
    typeRank:    0,
  })

  // 2) States
  const stateRows = parseTSV(download('states'))
  for (const r of stateRows) {
    const abbr = r.USPS
    if (!STATE_NAMES[abbr]) continue   // skip territories not in our map
    entries.push({
      id:          `state:${abbr}`,
      type:        'state',
      label:       STATE_NAMES[abbr],
      searchTerms: `${abbr} ${STATE_NAMES[abbr]}`.toLowerCase(),
      parents:     {},
      typeRank:    1,
    })
  }

  // 3) CBSAs — metros only (CBSA_TYPE=1; 2 = micropolitan, skipped)
  //    NAME format: "Austin-Round Rock-San Marcos, TX Metro Area"
  const cbsaRows = parseTSV(download('cbsas'))
  for (const r of cbsaRows) {
    if (r.CBSA_TYPE !== '1') continue
    const code = r.GEOID
    const name = r.NAME
    if (!code || !name) continue
    // Parse the state(s) out of the trailing ", XX-YY Metro Area" segment
    const m = name.match(/,\s+([A-Z]{2}(?:-[A-Z]{2})*)\s+Metro Area$/)
    if (!m) continue
    const primaryState = m[1].split('-')[0]
    if (!STATE_NAMES[primaryState]) continue
    entries.push({
      id:          `metro:${code}`,
      type:        'metro',
      label:       name,                                // "Austin-Round Rock-San Marcos, TX Metro Area"
      searchTerms: `${name} ${STATE_NAMES[primaryState]}`.toLowerCase(),
      parents:     { state: `state:${primaryState}` },
      typeRank:    2,
    })
  }

  // 4) Counties
  //    Gazetteer GEOID is 5-digit FIPS, USPS is state abbr.
  //    NAME already includes the suffix ("Austin County", "Orleans Parish",
  //    "Aleutians East Borough"), so don't append "County" ourselves.
  const countyRows = parseTSV(download('counties'))
  for (const r of countyRows) {
    const code = r.GEOID
    const abbr = r.USPS
    const name = r.NAME
    if (!STATE_NAMES[abbr] || !code || !name) continue
    entries.push({
      id:          `county:${code}`,
      type:        'county',
      label:       `${name}, ${abbr}`,
      searchTerms: `${name} ${abbr} ${STATE_NAMES[abbr]}`.toLowerCase(),
      parents:     { state: `state:${abbr}` },
      typeRank:    3,
    })
  }

  // 5) ZIPs — iterate every US state via `zipcodes` package
  let zipCount = 0
  for (const abbr of Object.keys(STATE_NAMES)) {
    const stateZips = zipcodes.lookupByState(abbr) || []
    for (const z of stateZips) {
      if (!z.zip || !z.city) continue
      entries.push({
        id:          `zip:${z.zip}`,
        type:        'zip',
        label:       `${z.zip} — ${z.city}, ${z.state}`,
        searchTerms: `${z.zip} ${z.city} ${z.state} ${STATE_NAMES[z.state] || ''}`.toLowerCase(),
        parents:     { state: `state:${z.state}` },
        typeRank:    4,
      })
      zipCount++
    }
  }

  console.log(`✓ states: ${entries.filter(e => e.type === 'state').length}`)
  console.log(`✓ metros: ${entries.filter(e => e.type === 'metro').length}`)
  console.log(`✓ counties: ${entries.filter(e => e.type === 'county').length}`)
  console.log(`✓ zips: ${zipCount}`)
  console.log(`✓ total entries: ${entries.length}`)

  return entries
}

function main() {
  console.log('Building geo index…')
  const entries = buildEntries()
  const out = {
    version:  `${YEAR}-gazetteer+zipcodes`,
    builtAt:  new Date().toISOString(),
    entries,
  }
  mkdirSync(dirname(OUT_PATH), { recursive: true })
  writeFileSync(OUT_PATH, JSON.stringify(out))
  const sizeMB = (Buffer.byteLength(JSON.stringify(out)) / 1024 / 1024).toFixed(2)
  console.log(`✓ wrote ${OUT_PATH} (${sizeMB} MB)`)
}

main()
