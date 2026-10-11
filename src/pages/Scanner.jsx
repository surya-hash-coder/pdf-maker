import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Camera, LoaderCircle } from 'lucide-react'
import { useScan } from '../context/ScanContext.jsx'
import CameraScanner from '../components/CameraScanner.jsx'
import FileUploader from '../components/FileUploader.jsx'
import ScanPreview from '../components/ScanPreview.jsx'
import ImageEnhancer from '../components/ImageEnhancer.jsx'
import ImageCropper from '../components/ImageCropper.jsx'
import PageThumbnailList from '../components/PageThumbnailList.jsx'
import DownloadPanel from '../components/DownloadPanel.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { ingestImageFile } from '../utils/imageEnhance.js'

export default function Scanner() {
  const { pages, addPages, updateSettings, removePage, movePage, clearPages } = useScan()
  const [params, setParams] = useSearchParams()
  const [cameraOpen, setCameraOpen] = useState(params.get('camera') === '1')
  const [selectedId, setSelectedId] = useState(null)
  const [cropping, setCropping] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null) // page id | 'all'
  const [importing, setImporting] = useState(false)
  const [importErrors, setImportErrors] = useState([])

  const selected = pages.find((p) => p.id === selectedId) ?? pages[0] ?? null
  const index = selected ? pages.indexOf(selected) : -1

  // Prevent accidental loss of captured pages on reload / tab close.
  useEffect(() => {
    if (!pages.length) return undefined
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [pages.length])

  const handleCapture = (items) => {
    const created = addPages(items)
    setSelectedId(created[created.length - 1].id)
  }

  const handleUpload = async (files) => {
    setImporting(true)
    setImportErrors([])
    const items = []
    const errs = []
    for (const f of files) {
      try { items.push({ ...(await ingestImageFile(f)), source: 'upload' }) } catch (e) { errs.push(e.message) }
    }
    setImportErrors(errs)
    if (items.length) {
      const created = addPages(items)
      setSelectedId(created[0].id)
      setCameraOpen(false)
    }
    setImporting(false)
  }

  const openCamera = () => { setCropping(false); setCameraOpen(true) }
  const closeCamera = () => { setCameraOpen(false); if (params.get('camera')) setParams({}, { replace: true }) }

  const confirmDelete = () => {
    if (pendingDelete === 'all') { clearPages(); setSelectedId(null) } else {
      const i = pages.findIndex((p) => p.id === pendingDelete)
      removePage(pendingDelete)
      setSelectedId(pages[i + 1]?.id ?? pages[i - 1]?.id ?? null)
    }
    setPendingDelete(null)
    setCropping(false)
  }

  const stage = cameraOpen ? (
    <CameraScanner pageCount={pages.length} onCapture={handleCapture} onUpload={handleUpload} onClose={closeCamera} />
  ) : selected ? (
    <div className="card p-4">
      {cropping ? (
        <ImageCropper key={selected.id} page={selected} onCancel={() => setCropping(false)}
          onApply={(crop) => { updateSettings(selected.id, { crop }); setCropping(false) }} />
      ) : (
        <>
          <ScanPreview page={selected} index={index} total={pages.length}
            onPrev={() => setSelectedId(pages[index - 1].id)} onNext={() => setSelectedId(pages[index + 1].id)} />
          <div className="mt-5 border-t border-line pt-5">
            <ImageEnhancer settings={selected.settings} onChange={(patch) => updateSettings(selected.id, patch)} onCrop={() => setCropping(true)} />
          </div>
        </>
      )}
    </div>
  ) : (
    <div className="card p-6">
      <h2 className="text-lg font-semibold">Start a scan</h2>
      <p className="mb-5 mt-1 text-ink-soft">Open the camera to capture pages, or add photos you already have.</p>
      <button className="btn btn-primary mb-5 !min-h-12" onClick={openCamera}><Camera size={20} aria-hidden="true" /> Open camera</button>
      <FileUploader onFiles={handleUpload} busy={importing} />
    </div>
  )

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Scan to PDF</h1>
        {!cameraOpen && pages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={openCamera}><Camera size={18} aria-hidden="true" /> Scan more</button>
            <FileUploader compact onFiles={handleUpload} busy={importing} />
          </div>
        )}
      </div>

      {importing && <p role="status" className="mb-4 flex items-center gap-2 text-sm text-ink-soft"><LoaderCircle className="animate-spin" size={16} aria-hidden="true" /> Importing photos…</p>}
      {importErrors.length > 0 && <ul role="alert" className="mb-4 space-y-1 text-sm text-danger">{importErrors.map((e) => <li key={e}>{e}</li>)}</ul>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>{stage}</div>
        <div className="space-y-6">
          <section className="card p-4" aria-labelledby="pages-h">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="pages-h" className="text-lg font-semibold">Pages ({pages.length})</h2>
              {pages.length > 1 && <button className="text-sm font-semibold text-danger" onClick={() => setPendingDelete('all')}>Delete all</button>}
            </div>
            <PageThumbnailList pages={pages} selectedId={selected?.id} onSelect={(id) => { setSelectedId(id); setCropping(false) }} onMove={movePage} onDelete={setPendingDelete} />
          </section>
          {pages.length > 0 && <DownloadPanel pages={pages} />}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete === 'all' ? 'Delete all pages?' : 'Delete this page?'}
        message={pendingDelete === 'all' ? `All ${pages.length} scanned pages will be removed. This can't be undone.` : "This page will be removed from the scan. This can't be undone."}
        onConfirm={confirmDelete} onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
