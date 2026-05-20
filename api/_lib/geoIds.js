// Canonical geography ID format.
// Phase 1: matches the existing geoData keys verbatim.
// Phase 2+ will introduce typed IDs like 'zip:78701', 'metro:12420', etc.

export const KNOWN_GEO_IDS = [
  'national',
  'state_tx',
  'metro_austin',
  'county_travis',
  'zip_78701',
]

export function isValidGeoId(id) {
  return typeof id === 'string' && KNOWN_GEO_IDS.includes(id)
}

export function normalizeGeoId(id, fallback = 'national') {
  return isValidGeoId(id) ? id : fallback
}
