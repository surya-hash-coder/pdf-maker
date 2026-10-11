export default function ProcessingProgress({ label, done, total }) {
  const pct = total ? Math.round((done / total) * 100) : 0
  return (
    <div role="status" aria-live="polite">
      <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span className="tabular-nums text-ink-soft">{done} / {total}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full rounded-full bg-brand transition-[width] duration-200" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
