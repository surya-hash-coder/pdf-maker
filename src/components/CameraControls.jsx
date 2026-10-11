import { Flashlight, FlashlightOff, SwitchCamera, Check } from 'lucide-react'

export default function CameraControls({ ready, busy, pageCount, devices, activeId, onSelect, onSwitch, torchAvailable, torchOn, onTorch, onShutter, onDone }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {torchAvailable && (
            <button className="btn btn-ghost !px-3" onClick={onTorch} aria-pressed={torchOn} aria-label={torchOn ? 'Turn flash off' : 'Turn flash on'}>
              {torchOn ? <Flashlight size={20} aria-hidden="true" /> : <FlashlightOff size={20} aria-hidden="true" />}
            </button>
          )}
          {devices.length > 1 && (
            <button className="btn btn-ghost !px-3" onClick={onSwitch} aria-label="Switch camera">
              <SwitchCamera size={20} aria-hidden="true" />
            </button>
          )}
        </div>

        <button
          onClick={onShutter}
          disabled={!ready || busy}
          aria-label="Capture page"
          className="grid size-[4.5rem] place-items-center rounded-full border-4 border-brand bg-white transition-transform active:scale-95 disabled:opacity-50"
        >
          <span className="size-12 rounded-full bg-brand" />
        </button>

        <button className="btn btn-primary" onClick={onDone}>
          <Check size={18} aria-hidden="true" /> Done{pageCount ? ` (${pageCount})` : ''}
        </button>
      </div>

      {devices.length > 1 && (
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Camera</span>
          <select className="field" value={activeId ?? ''} onChange={(e) => onSelect(e.target.value)}>
            {devices.map((d, i) => <option key={d.deviceId || i} value={d.deviceId}>{d.label || `Camera ${i + 1}`}</option>)}
          </select>
        </label>
      )}
    </div>
  )
}
