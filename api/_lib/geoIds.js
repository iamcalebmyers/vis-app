// Canonical geography ID format: `<type>:<code>` (e.g., `zip:78701`,
// `metro:12420`, `county:48453`, `state:TX`, `national`).
//
// Phase 1 used legacy keys like `metro_austin`; LEGACY_MAP translates them
// for backward compat with existing localStorage values.

export const GEO_TYPES = ['national', 'state', 'metro', 'county', 'zip']

// Legacy → typed translation. Maps the five mock-data keys to canonical IDs.
export const LEGACY_MAP = {
  national:      'national',
  state_tx:      'state:TX',
  metro_austin:  'metro:12420',
  county_travis: 'county:48453',
  zip_78701:     'zip:78701',
}

// Inverse — maps a typed ID back to its mock-data key (if any). Used by
// api/geo.js to find mock data for the 5 geos we have it for.
export const MOCK_KEY_FOR = Object.fromEntries(
  Object.entries(LEGACY_MAP).map(([legacy, typed]) => [typed, legacy])
)

export function parseGeoId(id) {
  if (id === 'national') return { type: 'national', code: null }
  const idx = String(id ?? '').indexOf(':')
  if (idx < 0) return null
  return { type: id.slice(0, idx), code: id.slice(idx + 1) }
}

export function isValidGeoId(id) {
  if (id === 'national') return true
  const parsed = parseGeoId(id)
  return !!parsed && GEO_TYPES.includes(parsed.type) && !!parsed.code
}

// Accept either a typed ID or a legacy key; return a canonical typed ID.
// Falls back to 'national' for unknown input.
export function normalizeGeoId(id) {
  if (!id) return 'national'
  if (LEGACY_MAP[id]) return LEGACY_MAP[id]
  if (isValidGeoId(id))  return id
  return 'national'
}
