import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, rectSortingStrategy,
  arrayMove, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import WidgetCard from './WidgetCard'
import WidgetRenderer from '../widgets/WidgetRenderer'

function SortableWidget({ widget }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 150ms ease',
    gridColumn: widget.size === 'large' ? 'span 2' : 'span 1',
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <WidgetCard widget={widget} dragListeners={listeners} dragAttributes={attributes} isDragging={isDragging}>
        <WidgetRenderer id={widget.id} />
      </WidgetCard>
    </div>
  )
}

export default function DashboardGrid({ enabledWidgets, reorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const ids = enabledWidgets.map(w => w.id)
    const oldIndex = ids.indexOf(active.id)
    const newIndex = ids.indexOf(over.id)
    reorder(arrayMove(ids, oldIndex, newIndex))
  }

  if (enabledWidgets.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '300px', gap: '12px',
      }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', color: 'var(--muted)' }}>
          No widgets enabled
        </span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--dim)' }}>
          Go to Settings to add widgets to your dashboard
        </span>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={enabledWidgets.map(w => w.id)} strategy={rectSortingStrategy}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridAutoFlow: 'dense',
          gap: '12px',
          padding: '20px 24px 24px',
        }}>
          {enabledWidgets.map(widget => (
            <SortableWidget key={widget.id} widget={widget} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
