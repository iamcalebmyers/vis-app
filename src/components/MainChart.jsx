import { useEffect, useRef } from 'react'
import { createChart, ColorType, LineStyle, LineSeries } from 'lightweight-charts'
import { CHART_DATA, WEEKS, SNAPSHOT_CARDS, GEO_OPTIONS } from '../mockData'

const CHART_TYPES = ['Line', 'Bar', 'Candle']
const TIMEFRAMES  = ['1W', '1M', '3M', '6M', '1Y', '5Y']

// Mar 1 2026 = Unix timestamp
const BASE_DATE = new Date('2026-03-01').getTime() / 1000
const DAY = 86400

function weekTimestamp(i) {
  return BASE_DATE + i * 7 * DAY
}

function toLineSeries(metric) {
  return (CHART_DATA[metric] || []).map((v, i) => ({
    time: weekTimestamp(i),
    value: v,
  }))
}

function toOverlaySeries() {
  return (CHART_DATA['Median Price'] || []).map((v, i) => ({
    time: weekTimestamp(i),
    value: v,
  }))
}

// SVG bar chart for Bar mode
function BarChart({ metric }) {
  const data = CHART_DATA[metric] || []
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 560
  const h = 140
  const barW = Math.floor(w / data.length) - 3

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      {data.map((v, i) => {
        const barH = Math.max(2, ((v - min) / range) * (h - 8))
        const x = i * (w / data.length) + 2
        const y = h - barH
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={barH}
            fill="var(--green)"
            rx="2"
            opacity="0.85"
          />
        )
      })}
    </svg>
  )
}

export default function MainChart({
  activeMetric,
  chartType,
  setChartType,
  timeframe,
  setTimeframe,
  showOverlay,
  setShowOverlay,
  geo,
  setGeo,
}) {
  const containerRef = useRef(null)
  const chartRef     = useRef(null)
  const seriesRef    = useRef(null)
  const overlayRef   = useRef(null)
  const roRef        = useRef(null)

  const card = SNAPSHOT_CARDS.find(c => c.label === activeMetric) || SNAPSHOT_CARDS[0]

  // Resolve CSS variable value at runtime
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  // Create chart on mount (line mode only)
  useEffect(() => {
    if (chartType !== 'line') return
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      width:  containerRef.current.clientWidth,
      height: 160,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: cssVar('--dim'),
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: cssVar('--border'), style: LineStyle.Dashed },
        horzLines: { color: cssVar('--border'), style: LineStyle.Dashed },
      },
      crosshair: { mode: 1 },
      rightPriceScale: {
        borderColor: cssVar('--border'),
        textColor: cssVar('--dim'),
      },
      timeScale: {
        borderColor: cssVar('--border'),
        textColor: cssVar('--dim'),
        visible: false,
      },
      handleScroll: true,
      handleScale:  true,
    })

    const series = chart.addSeries(LineSeries, {
      color:       cssVar('--green'),
      lineWidth:   2,
      crosshairMarkerVisible: true,
      lastValueVisible: true,
      priceLineVisible: false,
    })
    series.setData(toLineSeries(activeMetric))

    chartRef.current  = chart
    seriesRef.current = series

    // Hide TradingView attribution logo
    const hideAttr = new MutationObserver(() => {
      containerRef.current?.querySelectorAll('a[href*="tradingview"]').forEach(el => {
        el.style.display = 'none'
      })
      containerRef.current?.querySelectorAll('img[src*="tradingview"]').forEach(el => {
        el.style.display = 'none'
      })
    })
    if (containerRef.current) hideAttr.observe(containerRef.current, { childList: true, subtree: true })

    // ResizeObserver
    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth })
      }
    })
    ro.observe(containerRef.current)
    roRef.current = ro

    return () => {
      hideAttr.disconnect()
      ro.disconnect()
      chart.remove()
      chartRef.current  = null
      seriesRef.current = null
      overlayRef.current = null
    }
  }, [chartType])

  // Update series data when metric changes
  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.setData(toLineSeries(activeMetric))
    }
  }, [activeMetric])

  // Add/remove overlay series
  useEffect(() => {
    if (!chartRef.current) return
    if (showOverlay) {
      if (!overlayRef.current) {
        const overlay = chartRef.current.addSeries(LineSeries, {
          color:           cssVar('--yellow'),
          lineWidth:       2,
          priceLineVisible: false,
          lastValueVisible: true,
        })
        overlay.setData(toOverlaySeries())
        overlayRef.current = overlay
      }
    } else {
      if (overlayRef.current) {
        chartRef.current.removeSeries(overlayRef.current)
        overlayRef.current = null
      }
    }
  }, [showOverlay, chartType])

  const changeColor = card.up ? 'var(--green)' : 'var(--red)'
  const changeArrow = card.up ? '▲' : '▼'

  return (
    <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px' }}>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '22px',
          fontWeight: 800,
          color: 'var(--text)',
          letterSpacing: '-0.03em',
        }}>{activeMetric}</span>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--green)',
          marginLeft: '10px',
        }}>{card.value}</span>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '12px',
          color: changeColor,
          marginLeft: '6px',
        }}>{changeArrow} {card.change}</span>
      </div>

      {/* Controls row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
      }}>
        {/* Left: geo + overlay */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={geo}
            onChange={(e) => setGeo(e.target.value)}
          >
            {GEO_OPTIONS.map(g => <option key={g}>{g}</option>)}
          </select>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            color: 'var(--muted)',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={showOverlay}
              onChange={(e) => setShowOverlay(e.target.checked)}
            />
            Overlay Median Price
          </label>
        </div>

        {/* Right: chart type + timeframe */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Chart type toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--nav)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '3px',
            gap: '2px',
          }}>
            {CHART_TYPES.map(type => {
              const active = chartType === type.toLowerCase()
              return (
                <button
                  key={type}
                  onClick={() => setChartType(type.toLowerCase())}
                  style={{
                    background: active ? 'var(--card)' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: active ? 'var(--green)' : 'var(--muted)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    padding: '4px 12px',
                    cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >{type}</button>
              )
            })}
          </div>

          {/* Timeframe selector */}
          <div style={{
            display: 'flex',
            background: 'var(--nav)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '3px',
            gap: '2px',
          }}>
            {TIMEFRAMES.map(tf => {
              const active = timeframe === tf
              return (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    background: active ? 'var(--green)' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: active ? 'var(--nav)' : 'var(--muted)',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >{tf}</button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Chart box */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '16px 16px 10px',
        transition: 'border-color 0.15s',
      }}>
        {chartType === 'line' && (
          <div ref={containerRef} style={{ height: '160px' }} />
        )}

        {chartType === 'bar' && (
          <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end' }}>
            <BarChart metric={activeMetric} />
          </div>
        )}

        {chartType === 'candle' && (
          <div style={{
            height: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--muted)',
              fontStyle: 'italic',
            }}>Candlestick data requires OHLC format — available in v2</span>
          </div>
        )}

        {/* X-axis labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '6px',
          paddingTop: '6px',
          borderTop: '1px solid var(--border)',
        }}>
          {WEEKS.filter((_, i) => i % Math.ceil(WEEKS.length / 8) === 0 || i === WEEKS.length - 1)
            .slice(0, 8)
            .map((w, i) => (
              <span key={i} style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '9px',
                color: 'var(--dim)',
              }}>{w}</span>
            ))}
        </div>
      </div>

      {/* Overlay legend */}
      {showOverlay && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginTop: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '16px', height: '2px', background: 'var(--green)', borderRadius: '1px' }} />
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              color: 'var(--muted)',
            }}>{activeMetric}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '16px', height: '2px', background: 'var(--yellow)', borderRadius: '1px' }} />
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              color: 'var(--muted)',
            }}>Median Price</span>
          </div>
        </div>
      )}
    </div>
  )
}
