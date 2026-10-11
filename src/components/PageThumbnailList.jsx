import { useState } from 'react'
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from 'lucide-react'
import { usePagePreview } from '../hooks/usePagePreview.js'

function Thumb({ page }) {
  const { url } = usePagePreview(page, 220, 120)
  return url ? <img src={url} alt="" className="h-16 w-12 rounded border border-line bg-white object-cover" /> : <div className="h-16 w-12 animate-pulse rounded bg-line" />
}

export default function PageThumbnailList({ pages, selectedId, onSelect, onMove, onDelete }) {
  const [dragFrom, setDragFrom] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  if (!pages.length) return <p className="text-sm text-ink-soft">No pages yet. Capture or add photos to begin.</p>
  return (
    <ol className="space-y-2">
      {pages.map((p, i) => (
        <li
          key={p.id} draggable
          onDragStart={() => setDragFrom(i)}
          onDragOver={(e) => { e.preventDefault(); setDragOver(i) }}
          onDragEnd={() => { setDragFrom(null); setDragOver(null) }}
          onDrop={(e) => { e.preventDefault(); if (dragFrom !== null) onMove(dragFrom, i); setDragFrom(null); setDragOver(null) }}
          className={`flex items-center gap-2 rounded-xl border p-2 ${p.id === selectedId ? 'border-brand bg-brand-tint' : 'border-line bg-white'} ${dragOver === i && dragFrom !== i ? 'ring-2 ring-brand' : ''}`}
        >
          <GripVertical size={16} className="shrink-0 cursor-grab text-ink-soft" aria-hidden="true" />
          <button className="flex flex-1 items-center gap-3 text-left" onClick={() => onSelect(p.id)} aria-current={p.id === selectedId}>
            <Thumb page={p} />
            <span className="text-sm font-medium">Page {i + 1}</span>
          </button>
          <div className="flex shrink-0">
            <button className="btn btn-ghost !min-h-9 !px-2" onClick={() => onMove(i, i - 1)} disabled={i === 0} aria-label={`Move page ${i + 1} up`}><ArrowUp size={16} aria-hidden="true" /></button>
            <button className="btn btn-ghost !min-h-9 !px-2" onClick={() => onMove(i, i + 1)} disabled={i === pages.length - 1} aria-label={`Move page ${i + 1} down`}><ArrowDown size={16} aria-hidden="true" /></button>
            <button className="btn btn-danger !min-h-9 !px-2" onClick={() => onDelete(p.id)} aria-label={`Delete page ${i + 1}`}><Trash2 size={16} aria-hidden="true" /></button>
          </div>
        </li>
      ))}
    </ol>
  )
}
