import { createContext, useContext, useEffect, useState } from 'react'
import { geoData as LOCAL_MOCK, historicalPrices as LOCAL_HIST, GEO_LABELS } from '../data/geoData'

const GeoContext = createContext(null)

function pickLocal(id) {
  return {
    data:             LOCAL_MOCK[id]      ?? LOCAL_MOCK.national,
    national:         LOCAL_MOCK.national,
    historicalPrices: LOCAL_HIST[id]      ?? LOCAL_HIST.national,
  }
}

export function GeoProvider({ children }) {
  const [activeGeo, setActiveGeo] = useState(
    () => localStorage.getItem('vis-geo') || 'national'
  )

  // Seed from local mock immediately so widgets render on first paint
  // without null-checking. The API call below replaces this with whatever
  // the backend returns (currently the same mock data, eventually live).
  const [snapshot, setSnapshot] = useState(() => ({
    ...pickLocal(activeGeo),
    asOf: null,
    sources: { kind: 'mock-local' },
    isLoading: true,
    error: null,
  }))

  function changeGeo(key) {
    setActiveGeo(key)
    localStorage.setItem('vis-geo', key)
  }

  useEffect(() => {
    let cancelled = false

    // Re-seed with local mock for the new geo right away
    setSnapshot(s => ({ ...s, ...pickLocal(activeGeo), isLoading: true, error: null }))

    fetch(`/api/geo?id=${encodeURIComponent(activeGeo)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
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
      })
      .catch(err => {
        // npm run dev (no API) or transient failure — keep local mock,
        // record the error so devs can see it in props but don't break the UI
        if (cancelled) return
        setSnapshot(s => ({ ...s, isLoading: false, error: err.message }))
      })

    return () => { cancelled = true }
  }, [activeGeo])

  return (
    <GeoContext.Provider value={{
      activeGeo,
      setActiveGeo: changeGeo,
      geoLabel: GEO_LABELS[activeGeo],
      ...snapshot,
    }}>
      {children}
    </GeoContext.Provider>
  )
}

export const useGeo = () => useContext(GeoContext)
