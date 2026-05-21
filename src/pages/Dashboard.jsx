import { useState, useRef } from 'react'
import Nav from '../components/Nav'
import Ticker from '../components/Ticker'
import DataStatusBar from '../components/DataStatusBar'
import MainChart from '../components/MainChart'
import SnapshotCards from '../components/SnapshotCards'
import DashboardGrid from '../components/layout/DashboardGrid'
import GeoSelector from '../components/navigation/GeoSelector'
import { useWidgetConfig } from '../hooks/useWidgetConfig'
import { SNAPSHOT_CARDS } from '../mockData'

export default function Dashboard({
  metrics, topPanels, setTopPanels,
  editMode, setEditMode, onNavigate,
}) {
  const [activeMetric, setActiveMetric] = useState('30yr Rate')
  const [chartType,    setChartType]    = useState('line')
  const [timeframe,    setTimeframe]    = useState('1Y')
  const [showOverlay,  setShowOverlay]  = useState(false)
  const [geo,          setGeo]          = useState('National')
  const dragIdx = useRef(null)

  const { enabledWidgets, reorder } = useWidgetConfig()

  const visibleCards = metrics
    .filter(m => m.enabled)
    .map(m => SNAPSHOT_CARDS.find(c => c.label === m.label))
    .filter(Boolean)

  const activeCard = visibleCards.find(c => c.label === activeMetric) || visibleCards[0]
  const safeMetric = activeCard?.label || ''

  function handleDragStart(i) { dragIdx.current = i }
  function handleDragOver(e, i) {
    e.preventDefault()
    const from = dragIdx.current
    if (from === null || from === i) return
    setTopPanels(prev => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(i, 0, item)
      dragIdx.current = i
      return next
    })
  }
  function handleDragEnd() { dragIdx.current = null }

  function toggleTop(id) {
    setTopPanels(prev => prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p))
  }

  const mainChartPanel = topPanels.find(p => p.id === 'main-chart')
  const snapCardsPanel = topPanels.find(p => p.id === 'snapshot-cards')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Nav
        page="dashboard"
        onNavigate={onNavigate}
        editMode={editMode}
        onToggleEdit={() => setEditMode(e => !e)}
      />
      <Ticker />
      <DataStatusBar />

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Geo selector */}
        <div style={{ padding: '10px 24px 0' }}>
          <GeoSelector />
        </div>

        {/* Main chart panel */}
        {(!mainChartPanel || mainChartPanel.visible) && (
          <div
            draggable={editMode}
            onDragStart={() => handleDragStart(0)}
            onDragOver={e => handleDragOver(e, 0)}
            onDragEnd={handleDragEnd}
            style={{ padding: '10px 24px 0' }}
          >
            {editMode && (
              <EditBar label="Main Chart" visible={mainChartPanel?.visible ?? true} onToggle={() => toggleTop('main-chart')} />
            )}
            <MainChart
              activeMetric={safeMetric}
              chartType={chartType}
              setChartType={setChartType}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              showOverlay={showOverlay}
              setShowOverlay={setShowOverlay}
              geo={geo}
              setGeo={setGeo}
            />
          </div>
        )}

        {/* Snapshot cards — iPhone-style edit mode handled internally */}
        {(!snapCardsPanel || snapCardsPanel.visible) && (
          <SnapshotCards
            activeMetric={safeMetric}
            onSelect={setActiveMetric}
            editMode={editMode}
          />
        )}

        {/* Section header for unified widget grid */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 24px 0' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.1em' }}>
            MARKET INTELLIGENCE
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: 'var(--dim)' }}>
            {enabledWidgets.length} widgets
          </span>
        </div>

        {/* Unified widget grid — every panel is here, interchangeable */}
        <DashboardGrid enabledWidgets={enabledWidgets} reorder={reorder} />
      </div>
    </div>
  )
}

function EditBar({ label, visible, onToggle }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '4px 8px', marginBottom: '4px',
      background: 'rgba(0,232,122,0.05)',
      borderRadius: '6px',
      border: '1px dashed rgba(0,232,122,0.25)',
    }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, color: 'var(--dim)' }}>{label}</span>
      <button
        onClick={onToggle}
        style={{
          background: 'none',
          border: `1px solid ${visible ? 'var(--border)' : 'rgba(0,232,122,0.4)'}`,
          borderRadius: '5px',
          color: visible ? 'var(--muted)' : 'var(--green)',
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', fontWeight: 700,
          letterSpacing: '0.06em', padding: '2px 8px', cursor: 'pointer',
        }}
      >{visible ? 'HIDE' : 'SHOW'}</button>
    </div>
  )
}
