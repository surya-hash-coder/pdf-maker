import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Download, FileText, LoaderCircle, X } from 'lucide-react'
import ProcessingProgress from './ProcessingProgress.jsx'
import { buildScanPdf, QUALITY } from '../utils/pdfGenerate.js'
import { formatBytes } from '../utils/fileValidation.js'

const PDFViewer = lazy(() => import('./PDFViewer.jsx')) // keeps PDF.js out of the main bundle

const sanitize = (name) => (name.replace(/[\\/:*?"<>|]+/g, '').trim() || 'Scan').slice(0, 80)

function Select({ label, value, onChange, children, disabled }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-ink-soft">{label}</span>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>{children}</select>
    </label>
  )
}

export default function DownloadPanel({ pages }) {
  const [opts, setOpts] = useState({ title: 'Scan', size: 'a4', orientation: 'auto', margin: 'small', quality: 'medium' })
  const [progress, setProgress] = useState(null) // { done, total }
  const [result, setResult] = useState(null) // { blob, url, pageCount }
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const set = (patch) => setOpts((o) => ({ ...o, ...patch }))
  const working = progress !== null

  // A generated PDF is stale as soon as pages or options change.
  useEffect(() => () => result && URL.revokeObjectURL(result.url), [result])
  useEffect(() => { setResult(null) }, [pages])

  const generate = async () => {
    setError(null)
    setResult(null)
    abortRef.current = new AbortController()
    setProgress({ done: 0, total: pages.length })
    try {
      const blob = await buildScanPdf(pages, { ...opts, title: sanitize(opts.title) }, (done, total) => setProgress({ done, total }), abortRef.current.signal)
      setResult({ blob, url: URL.createObjectURL(blob), pageCount: pages.length })
    } catch (e) {
      if (e.name !== 'AbortError') setError(`Could not create the PDF: ${e.message}`)
    } finally {
      setProgress(null)
    }
  }

  return (
    <section className="card p-4" aria-labelledby="export-h">
      <h2 id="export-h" className="text-lg font-semibold">Create PDF</h2>
      <div className="mt-3 space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">File name</span>
          <input className="field" value={opts.title} onChange={(e) => set({ title: e.target.value })} maxLength={80} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Page size" value={opts.size} onChange={(size) => set({ size })}>
            <option value="a4">A4</option><option value="letter">Letter</option><option value="fit">Fit to image</option>
          </Select>
          <Select label="Orientation" value={opts.orientation} onChange={(orientation) => set({ orientation })} disabled={opts.size === 'fit'}>
            <option value="auto">Match each page</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option>
          </Select>
          <Select label="Margins" value={opts.margin} onChange={(margin) => set({ margin })}>
            <option value="none">None</option><option value="small">Small (10 mm)</option><option value="medium">Medium (20 mm)</option>
          </Select>
          <Select label="Quality" value={opts.quality} onChange={(quality) => set({ quality })}>
            {Object.entries(QUALITY).map(([k, q]) => <option key={k} value={k}>{q.label}</option>)}
          </Select>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {working ? (
          <>
            <ProcessingProgress label="Processing pages" done={progress.done} total={progress.total} />
            <button className="btn btn-ghost w-full" onClick={() => abortRef.current?.abort()}><X size={18} aria-hidden="true" /> Cancel</button>
          </>
        ) : (
          <button className="btn btn-primary w-full" onClick={generate} disabled={!pages.length}>
            <FileText size={18} aria-hidden="true" /> {result ? 'Regenerate PDF' : `Create PDF from ${pages.length} page${pages.length === 1 ? '' : 's'}`}
          </button>
        )}
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </div>

      {result && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-brand-tint p-3 text-sm">
            <span><strong>{sanitize(opts.title)}.pdf</strong> · {result.pageCount} page{result.pageCount === 1 ? '' : 's'} · {formatBytes(result.blob.size)}</span>
          </div>
          <Suspense fallback={<p className="text-sm text-ink-soft" role="status">Loading preview…</p>}><PDFViewer blob={result.blob} /></Suspense>
          <a className="btn btn-primary w-full" href={result.url} download={`${sanitize(opts.title)}.pdf`}>
            <Download size={18} aria-hidden="true" /> Download PDF
          </a>
        </div>
      )}
      {working && <LoaderCircle className="sr-only" aria-hidden="true" />}
    </section>
  )
}
