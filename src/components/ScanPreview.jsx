import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePagePreview } from '../hooks/usePagePreview.js'

export default function ScanPreview({ page, index, total, onPrev, onNext }) {
  const { url, loading, error } = usePagePreview(page, 1400)
  return (
    <div>
      <div className="relative grid min-h-64 place-items-center rounded-xl bg-mist p-3">
        {error && <p role="alert" className="text-danger">{error}</p>}
        {url && <img src={url} alt={`Scanned page ${index + 1} of ${total}`} className={`max-h-[56vh] max-w-full rounded bg-white shadow-md transition-opacity ${loading ? 'opacity-60' : ''}`} />}
        {!url && !error && <p className="text-ink-soft" role="status">Preparing preview…</p>}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button className="btn btn-ghost !px-3" onClick={onPrev} disabled={index === 0} aria-label="Previous page"><ChevronLeft size={20} aria-hidden="true" /></button>
        <p className="text-sm text-ink-soft" aria-live="polite">Page {index + 1} of {total}</p>
        <button className="btn btn-ghost !px-3" onClick={onNext} disabled={index === total - 1} aria-label="Next page"><ChevronRight size={20} aria-hidden="true" /></button>
      </div>
    </div>
  )
}
