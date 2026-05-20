import { useEffect, useRef, useState } from 'react'
import { useGeo } from '../../context/GeoContext'

const DEBOUNCE_MS = 200
const MIN_QUERY   = 2

const TYPE_LABEL = { state: 'State', metro: 'Metro', county: 'County', zip: 'ZIP', national: 'US' }
const TYPE_COLOR = {
  state:    'var(--green)',
  metro:    'var(--yellow)',
  county:   'var(--muted)',
  zip:      'var(--text)',
  national: 'var(--green)',
}

// Fallback fetch shim in case useGeoData isn't running (e.g. dev without API)
async function resolveQuery(q) {
  try {
    const r = await fetch(`/api/resolve?q=${encodeURIComponent(q)}`)
    if (!r.ok) return []
    const j = await r.json()
    return j.results || []
  } catch {
    return []
  }
}

export default function GeoSearch() {
  const { setActiveGeo, recents, geoLabel } = useGeo()
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [open,     setOpen]     = useState(false)
  const [activeIdx,setActiveIdx]= useState(0)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  // Debounced search
  useEffect(() => {
    const q = query.trim()
    if (q.length < MIN_QUERY) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      const res = await resolveQuery(q)
      setResults(res)
      setLoading(false)
      setActiveIdx(0)
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [query])

  // Click outside closes
  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // What to show in the dropdown — search results, or recents when empty
  const items = query.trim().length >= MIN_QUERY
    ? results
    : (recents || []).map(r => ({ id: r.id, label: r.label, type: 'recent', _isRecent: true }))

  function commit(item) {
    setActiveGeo(item.id, item.label)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter')     { if (items[activeIdx]) commit(items[activeIdx]) }
    else if (e.key === 'Escape')    { setOpen(false); inputRef.current?.blur() }
  }

  const showDropdown = open && (loading || items.length > 0 || query.trim().length >= MIN_QUERY)

  // Compact by default (220px) so it fits alongside the nav tabs + buttons;
  // expands to 320px when focused so there's room to type long queries.
  const width = open ? 320 : 220

  return (
    <div ref={wrapRef} style={{ position: 'relative', width, transition: 'width 0.18s ease' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'var(--card)',
        border: `1px solid ${open ? 'rgba(0,232,122,0.4)' : 'var(--border)'}`,
        borderRadius: '6px',
        padding: '4px 10px',
        transition: 'border-color 0.15s',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search ZIP, city, county…"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            width: '100%',
          }}
        />
        {loading && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'var(--dim)' }}>…</span>}
      </div>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0, right: 0,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          maxHeight: '360px',
          overflowY: 'auto',
          zIndex: 100,
        }}>
          {!loading && items.length === 0 && (
            <div style={{ padding: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--dim)', textAlign: 'center' }}>
              {query.trim().length >= MIN_QUERY ? `No matches for "${query.trim()}"` : 'Start typing…'}
            </div>
          )}

          {items.length > 0 && items[0]._isRecent && (
            <div style={{ padding: '6px 10px 2px', fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.1em' }}>
              RECENT
            </div>
          )}

          {items.map((item, idx) => {
            const active = idx === activeIdx
            const typeForBadge = item.type === 'recent' ? 'state' : item.type
            return (
              <button
                key={item.id + ':' + idx}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => commit(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%',
                  background: active ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border: 'none',
                  padding: '7px 10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '8px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: TYPE_COLOR[typeForBadge] || 'var(--muted)',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '2px 5px',
                  borderRadius: '3px',
                  minWidth: '34px',
                  textAlign: 'center',
                  flexShrink: 0,
                }}>
                  {item._isRecent ? '↻' : TYPE_LABEL[item.type] || item.type}
                </span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: 'var(--text)',
                  flex: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
