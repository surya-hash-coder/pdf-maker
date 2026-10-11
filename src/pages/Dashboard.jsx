import { Link } from 'react-router-dom'
import { Camera, Upload, ArrowRight } from 'lucide-react'
import { useScan } from '../context/ScanContext.jsx'

const SHORTCUTS = [
  { to: '/app/scan', title: 'Scan to PDF', text: 'Capture or upload pages and export a PDF.', live: true },
  { to: '/app/tools', title: 'PDF tools', text: 'Merge, split, rotate, extract, reorder.', live: false },
  { to: '/app/ocr', title: 'Text from scans (OCR)', text: 'Recognize text and make searchable PDFs.', live: false },
  { to: '/app/convert', title: 'Convert documents', text: 'Word, text and image conversions.', live: false },
]

export default function Dashboard() {
  const { pages } = useScan()
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/app/scan?camera=1" className="btn btn-primary !min-h-12"><Camera size={20} aria-hidden="true" /> Start scanning</Link>
          <Link to="/app/scan" className="btn btn-ghost !min-h-12"><Upload size={20} aria-hidden="true" /> Upload documents</Link>
        </div>
      </div>

      <section aria-labelledby="short-h">
        <h2 id="short-h" className="text-xl font-semibold">Tools</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {SHORTCUTS.map((s) => (
            <li key={s.to}>
              <Link to={s.to} className="card block h-full p-5 hover:border-brand">
                <span className="flex items-center justify-between font-semibold">{s.title}<ArrowRight size={18} aria-hidden="true" /></span>
                <span className="mt-1 block text-sm text-ink-soft">{s.text}</span>
                <span className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.live ? 'bg-[#e3f5ea] text-ok' : 'bg-mist text-ink-soft'}`}>{s.live ? 'Available' : 'Not built yet'}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-h">
        <h2 id="recent-h" className="text-xl font-semibold">Current session</h2>
        {pages.length ? (
          <div className="card mt-4 flex flex-wrap items-center justify-between gap-3 p-5">
            <p>{pages.length} scanned page{pages.length === 1 ? '' : 's'} waiting. They are kept in memory only and disappear if you reload the page.</p>
            <Link to="/app/scan" className="btn btn-primary">Continue scanning</Link>
          </div>
        ) : (
          <div className="card mt-4 p-5 text-ink-soft">
            No pages in this session. Saved document history is not built yet, so nothing is stored between visits.
          </div>
        )}
      </section>
    </div>
  )
}
