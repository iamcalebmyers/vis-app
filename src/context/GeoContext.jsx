import { createContext, useContext, useState } from 'react'
import { GEO_LABELS } from '../data/geoData'

const GeoContext = createContext(null)

export function GeoProvider({ children }) {
  const [activeGeo, setActiveGeo] = useState(
    () => localStorage.getItem('vis-geo') || 'national'
  )

  function changeGeo(key) {
    setActiveGeo(key)
    localStorage.setItem('vis-geo', key)
  }

  return (
    <GeoContext.Provider value={{ activeGeo, setActiveGeo: changeGeo, geoLabel: GEO_LABELS[activeGeo] }}>
      {children}
    </GeoContext.Provider>
  )
}

export const useGeo = () => useContext(GeoContext)
