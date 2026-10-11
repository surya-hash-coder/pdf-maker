import { Crop, RotateCcw, RotateCw, Undo2 } from 'lucide-react'
import { DEFAULT_SETTINGS, FILTERS } from '../utils/imageEnhance.js'

function Slider({ label, value, onChange }) {
  return (
    <label className="block text-sm">
      <span className="flex justify-between"><span>{label}</span><span className="tabular-nums text-ink-soft">{value}</span></span>
      <input type="range" min={-100} max={100} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full accent-brand" />
    </label>
  )
}

export default function ImageEnhancer({ settings, onChange, onCrop }) {
  const rotate = (d) => onChange({ rotation: (settings.rotation + d + 360) % 360 })
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Look</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" aria-pressed={settings.filter === f.id} onClick={() => onChange({ filter: f.id })}
              className={`btn !min-h-10 text-sm ${settings.filter === f.id ? 'btn-primary' : 'btn-ghost'}`}>{f.label}</button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Brightness" value={settings.brightness} onChange={(brightness) => onChange({ brightness })} />
        <Slider label="Contrast" value={settings.contrast} onChange={(contrast) => onChange({ contrast })} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-ghost" onClick={() => rotate(-90)}><RotateCcw size={18} aria-hidden="true" /> Rotate left</button>
        <button className="btn btn-ghost" onClick={() => rotate(90)}><RotateCw size={18} aria-hidden="true" /> Rotate right</button>
        <button className="btn btn-ghost" onClick={onCrop}><Crop size={18} aria-hidden="true" /> Crop</button>
        <button className="btn btn-ghost" onClick={() => onChange({ ...DEFAULT_SETTINGS })}><Undo2 size={18} aria-hidden="true" /> Reset page</button>
      </div>
    </div>
  )
}
