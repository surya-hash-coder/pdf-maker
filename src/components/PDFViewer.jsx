import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

/** Renders every page of a PDF Blob to canvases with PDF.js (works on mobile browsers that can't embed PDFs). */
export default function PDFViewer({ blob }) {
  const hostRef = useRef(null)
  const [state, setState] = useState({ status: 'loading', pages: 0, error: null })

  useEffect(() => {
    let cancelled = false
    let doc = null
    const host = hostRef.current
    host.replaceChildren()
    setState({ status: 'loading', pages: 0, error: null })
    ;(async () => {
      try {
        const data = new Uint8Array(await blob.arrayBuffer())
        doc = await pdfjsLib.getDocument({ data }).promise
        const width = Math.min(host.clientWidth || 600, 900)
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        for (let n = 1; n <= doc.numPages; n++) {
          if (cancelled) return
          const page = await doc.getPage(n)
          const base = page.getViewport({ scale: 1 })
          const viewport = page.getViewport({ scale: (width / base.width) * dpr })
          const canvas = document.createElement('canvas')
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          canvas.style.width = `${width}px`
          canvas.style.maxWidth = '100%'
          canvas.className = 'mx-auto mb-3 rounded bg-white shadow'
          canvas.setAttribute('role', 'img')
          canvas.setAttribute('aria-label', `PDF page ${n} of ${doc.numPages}`)
          host.appendChild(canvas)
          await page.render({ canvas, viewport }).promise
        }
        if (!cancelled) setState({ status: 'ready', pages: doc.numPages, error: null })
      } catch (e) {
        if (!cancelled) setState({ status: 'error', pages: 0, error: e.message })
      }
    })()
    return () => {
      cancelled = true
      doc?.destroy()
    }
  }, [blob])

  return (
    <div>
      {state.status === 'loading' && <p className="text-sm text-ink-soft" role="status">Rendering preview…</p>}
      {state.status === 'error' && <p role="alert" className="text-sm text-danger">Preview failed: {state.error}</p>}
      <div ref={hostRef} className="max-h-[60vh] overflow-auto rounded-xl bg-mist p-3" />
    </div>
  )
}
