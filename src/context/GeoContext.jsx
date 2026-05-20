import { createContext, useContext, useEffect, useState } from 'react'
import { geoData as LOCAL_MOCK, historicalPrices as LOCAL_HIST } from '../data/geoData'

const GeoContext = createContext(null)

// Legacy → typed translation, mirroring api/_lib/geoIds.js so first-load
// localStorage values from Phase 1 still work.
const LEGACY_MAP = {
  national:      'national',
  state_tx:      'state:TX',
  metro_austin:  'metro:12420',
  county_travis: 'county:48453',
  zip_78701:     'zip:78701',
}
const MOCK_KEY_FOR = Object.fromEntries(
  Object.entries(LEGACY_MAP).map(([legacy, typed]) => [typed, legacy])
)

function loadGeo() {
  const raw = localStorage.getItem('vis-geo')
  if (!raw) return { id: 'national', label: '🇺🇸 United States' }
  // Phase 1 stored a bare string; Phase 2 stores JSON. Detect & translate.
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && parsed.id) return parsed
  } catch {/* fall through to legacy string handling */}
  const typedId = LEGACY_MAP[raw] || raw
  return { id: typedId, label: raw }
}

function loadRecents() {
  try {
    const raw = localStorage.getItem('vis-recent-geos')
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.slice(0, 5) : []
  } catch { return [] }
}

function pickLocal(id) {
  const mockKey = MOCK_KEY_FOR[id]
  return {
    data:             (mockKey && LOCAL_MOCK[mockKey]) || LOCAL_MOCK.national,
    national:         LOCAL_MOCK.national,
    historicalPrices: (mockKey && LOCAL_HIST[mockKey]) || LOCAL_HIST.national,
  }
}

export function GeoProvider({ children }) {
  const [geo, setGeo]         = useState(loadGeo)        // { id, label }
  const [recents, setRecents] = useState(loadRecents)
  const [parents, setParents] = useState([])
  const [snapshot, setSnapshot] = useState(() => ({
    ...pickLocal(geo.id),
    asOf: null,
    sources: { kind: 'mock-local' },
    isLoading: true,
    error: null,
  }))

  function changeGeo(id, label) {
    const next = { id, label: label || id }
    setGeo(next)
    localStorage.setItem('vis-geo', JSON.stringify(next))

    // Prepend to recents (dedupe, cap at 5)
    setRecents(prev => {
      const filtered = prev.filter(r => r.id !== id)
      const updated  = [next, ...filtered].slice(0, 5)
      localStorage.setItem('vis-recent-geos', JSON.stringify(updated))
      return updated
    })
  }

  useEffect(() => {
    let cancelled = false
    setSnapshot(s => ({ ...s, ...pickLocal(geo.id), isLoading: true, error: null }))

    fetch(`/api/geo?id=${encodeURIComponent(geo.id)}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(json => {
        if (cancelled) return
        setSnapshot({
          data:             json.data,
          national:         json.national,
          historicalPrices: json.historicalPrices,
          asOf:             json.asOf,
          sources:          json.sources,
          isLoading:        false,
          error:            null,
        })
        setParents(Array.isArray(json.parents) ? json.parents : [])
        // If API returned a fuller label (with emoji/state), keep ours in sync
        if (json.label && json.label !== geo.label) {
          setGeo(g => {
            const merged = { ...g, label: json.label }
            localStorage.setItem('vis-geo', JSON.stringify(merged))
            return merged
          })
        }
      })
      .catch(err => {
        if (cancelled) return
        setSnapshot(s => ({ ...s, isLoading: false, error: err.message }))
      })

    return () => { cancelled = true }
  }, [geo.id])

  return (
    <GeoContext.Provider value={{
      activeGeo: geo.id,
      geoLabel:  geo.label,
      parents,
      recents,
      setActiveGeo: changeGeo,
      ...snapshot,
    }}>
      {children}
    </GeoContext.Provider>
  )
}

export const useGeo = () => useContext(GeoContext)
