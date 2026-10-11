import { useRef, useState } from 'react'
import { useObjectUrl } from '../hooks/usePagePreview.js'

const MIN = 0.05
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export function applyDelta(c, mode, dx, dy) {
  if (mode === 'move') return { ...c, x: clamp(c.x + dx, 0, 1 - c.w), y: clamp(c.y + dy, 0, 1 - c.h) }
  let l = c.x, t = c.y, r = c.x + c.w, b = c.y + c.h
  if (mode.includes('l')) l = clamp(l + dx, 0, r - MIN)
  if (mode.includes('r')) r = clamp(r + dx, l + MIN, 1)
  if (mode.includes('t')) t = clamp(t + dy, 0, b - MIN)
  if (mode.includes('b')) b = clamp(b + dy, t + MIN, 1)
  return { x: l, y: t, w: r - l, h: b - t }
}

const HANDLES = [
  ['tl', 'left-0 top-0 cursor-nwse-resize', 'Top left corner'],
  ['t', 'left-1/2 top-0 cursor-ns-resize', 'Top edge'],
  ['tr', 'left-full top-0 cursor-nesw-resize', 'Top right corner'],
  ['r', 'left-full top-1/2 cursor-ew-resize', 'Right edge'],
  ['br', 'left-full top-full cursor-nwse-resize', 'Bottom right corner'],
  ['b', 'left-1/2 top-full cursor-ns-resize', 'Bottom edge'],
  ['bl', 'left-0 top-full cursor-nesw-resize', 'Bottom left corner'],
  ['l', 'left-0 top-1/2 cursor-ew-resize', 'Left edge'],
]

/** Crop over the original (unrotated, unfiltered) image. Pointer or arrow-key adjustable. */
export default function ImageCropper({ page, onApply, onCancel }) {
  const url = useObjectUrl(page.blob)
  const [crop, setCrop] = useState(page.settings.crop)
  const wrapRef = useRef(null)
  const drag = useRef(null)

  const down = (e, mode) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { mode, x: e.clientX, y: e.clientY, start: crop }
  }
  const move = (e) => {
    const d = drag.current
    if (!d) return
    const rect = wrapRef.current.getBoundingClientRect()
    setCrop(applyDelta(d.start, d.mode, (e.clientX - d.x) / rect.width, (e.clientY - d.y) / rect.height))
  }
  const up = () => { drag.current = null }
  const key = (e, mode) => {
    const step = e.shiftKey ? 0.05 : 0.01
    const map = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (!map[e.key]) return
    e.preventDefault()
    setCrop((c) => applyDelta(c, mode, ...map[e.key]))
  }

  return (
    <div>
      <div className="grid place-items-center rounded-xl bg-mist p-3">
        {url && (
          <div ref={wrapRef} className="relative inline-block touch-none select-none">
            <img src={url} alt="Page to crop" draggable={false} className="block max-h-[56vh] max-w-full" />
            <div
              className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(15,27,61,0.6)]"
              style={{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%` }}
              onPointerDown={(e) => down(e, 'move')} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
              onKeyDown={(e) => key(e, 'move')} tabIndex={0} role="group" aria-label="Crop area. Use arrow keys to move it."
            >
              {HANDLES.map(([mode, pos, label]) => (
                <button
                  key={mode} type="button" aria-label={`Resize from ${label.toLowerCase()}`}
                  className={`absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand bg-white ${pos}`}
                  onPointerDown={(e) => { e.stopPropagation(); down(e, mode) }} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
                  onKeyDown={(e) => { e.stopPropagation(); key(e, mode) }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={() => onApply(crop)}>Apply crop</button>
        <button className="btn btn-ghost" onClick={() => setCrop({ x: 0, y: 0, w: 1, h: 1 })}>Reset</button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
