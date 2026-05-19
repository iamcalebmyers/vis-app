import { useState, useEffect, useRef } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, rectSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SNAPSHOT_CARDS } from '../mockData'

const DEFAULT_ORDER = ['30yr Rate', 'Median Price', 'Inventory', 'Days on Market', 'List/Sale Ratio', 'Price Cuts']
const CARDS_BY_LABEL = Object.fromEntries(SNAPSHOT_CARDS.map(c => [c.label, c]))

function loadOrder() {
  try {
    const v = localStorage.getItem('vis-card-order')
    if (v) return JSON.parse(v)
  } catch {}
  return DEFAULT_ORDER
}
function loadHidden() {
  try {
    const v = localStorage.getItem('vis-cards-hidden')
    if (v) return JSON.parse(v)
  } catch {}
  return []
}

function Sparkline({ data, up }) {
  const color = up ? 'var(--green)' : 'var(--red)'
  const w = 100
  const h = 28
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  })

  const lastX = w
  const lastY = h - ((data[data.length - 1] - min) / range) * (h - 4) - 2

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ display: 'block', marginTop: '8px' }}
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
    </svg>
  )
}

function CardContent({ card }) {
  return (
    <>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '9px',
        color: 'var(--dim)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>{card.label}</div>

      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '17px',
        fontWeight: 800,
        color: 'var(--text)',
        marginTop: '4px',
      }}>{card.value}</div>

      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '10px',
        color: card.up ? 'var(--green)' : 'var(--red)',
        marginTop: '2px',
      }}>
        {card.up ? '▲' : '▼'} {card.change}
      </div>

      <Sparkline data={card.spark} up={card.up} />
    </>
  )
}

function SortableCard({ label, idx, active, editMode, onSelect, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: label })

  const card = CARDS_BY_LABEL[label]
  if (!card) return null

  const baseTransform = CSS.Transform.toString(transform)

  const style = {
    transform: baseTransform,
    transition: transition || 'transform 150ms ease',
    background: active ? 'rgba(0, 232, 122, 0.04)' : 'var(--card)',
    border: active ? '1px solid rgba(0, 232, 122, 0.4)' : '1px solid var(--border)',
    borderRadius: '12px',
    padding: '14px 14px 10px',
    cursor: editMode ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
    position: 'relative',
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 5 : 1,
    animation: editMode && !isDragging ? 'jiggle 0.4s ease-in-out infinite' : 'none',
    animationDelay: editMode ? `${idx * 0.05}s` : '0s',
    transformOrigin: 'center',
    userSelect: 'none',
    touchAction: editMode ? 'none' : 'auto',
  }

  function handleMouseEnter(e) {
    if (!active && !editMode) e.currentTarget.style.borderColor = 'var(--dim)'
  }
  function handleMouseLeave(e) {
    if (!active && !editMode) e.currentTarget.style.borderColor = 'var(--border)'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(editMode ? listeners : {})}
      {...(editMode ? attributes : {})}
      onClick={() => { if (!editMode) onSelect?.(label) }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {editMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(label) }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'var(--red)',
            color: 'white',
            border: 'none',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            padding: 0,
            fontFamily: 'system-ui, sans-serif',
          }}
        >×</button>
      )}
      <CardContent card={card} />
    </div>
  )
}

export default function SnapshotCards({ activeMetric, onSelect, editMode = false }) {
  const [order,  setOrder]  = useState(loadOrder)
  const [hidden, setHidden] = useState(loadHidden)
  const wasEditRef = useRef(editMode)

  // Persist only when transitioning OUT of edit mode
  useEffect(() => {
    if (wasEditRef.current && !editMode) {
      localStorage.setItem('vis-card-order',   JSON.stringify(order))
      localStorage.setItem('vis-cards-hidden', JSON.stringify(hidden))
    }
    wasEditRef.current = editMode
  }, [editMode, order, hidden])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    setOrder(prev => {
      const oldI = prev.indexOf(active.id)
      const newI = prev.indexOf(over.id)
      if (oldI < 0 || newI < 0) return prev
      return arrayMove(prev, oldI, newI)
    })
  }

  function removeCard(label) {
    setOrder(prev  => prev.filter(l => l !== label))
    setHidden(prev => prev.includes(label) ? prev : [...prev, label])
  }
  function restoreCard(label) {
    setHidden(prev => prev.filter(l => l !== label))
    setOrder(prev  => prev.includes(label) ? prev : [...prev, label])
  }

  const cardCount = Math.max(order.length, 1)

  return (
    <div style={{ padding: '0 24px', marginTop: '16px', flexShrink: 0 }}>
      {editMode && (
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          color: 'var(--muted)',
          padding: '6px 0',
          marginBottom: '4px',
          letterSpacing: '0.04em',
          animation: 'fadeIn 0.2s ease',
        }}>
          Drag cards to rearrange · Click × to hide
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cardCount}, 1fr)`,
            gap: '10px',
          }}>
            {order.map((label, idx) => (
              <SortableCard
                key={label}
                label={label}
                idx={idx}
                active={label === activeMetric}
                editMode={editMode}
                onSelect={onSelect}
                onRemove={removeCard}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editMode && hidden.length > 0 && (
        <div style={{ marginTop: '12px', animation: 'fadeIn 0.2s ease' }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: 'var(--muted)',
            letterSpacing: '0.08em',
            marginBottom: '6px',
          }}>Hidden metrics</div>
          <div style={{
            padding: '12px 16px',
            background: 'var(--card)',
            border: '1px dashed var(--border)',
            borderRadius: '12px',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}>
            {hidden.map(label => (
              <div key={label} style={{
                background: 'var(--nav)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  color: 'var(--muted)',
                }}>{label}</span>
                <button
                  onClick={() => restoreCard(label)}
                  style={{
                    fontSize: '16px',
                    color: 'var(--green)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    lineHeight: 1,
                    padding: 0,
                  }}
                  aria-label={`Restore ${label}`}
                >+</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
