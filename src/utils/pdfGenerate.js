import { PDFDocument } from 'pdf-lib'
import { renderPage, canvasToBlob, decodeBlob } from './imageEnhance.js'

const MM = 72 / 25.4
export const PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792] }
export const MARGINS = { none: 0, small: 10 * MM, medium: 20 * MM }
export const QUALITY = {
  low: { maxSide: 1600, jpeg: 0.6, label: 'Small file' },
  medium: { maxSide: 2400, jpeg: 0.8, label: 'Balanced' },
  high: { maxSide: 3400, jpeg: 0.92, label: 'Best quality' },
}
// "fit" pages are sized to the image at this density (pixels per inch).
const FIT_DPI = 150

/**
 * Pure layout maths (unit-tested): where does an image of imgW x imgH go on its PDF page?
 * Returns { pageW, pageH, x, y, w, h } in PDF points (origin bottom-left).
 */
export function computeLayout(imgW, imgH, { size = 'a4', orientation = 'portrait', margin = 0 } = {}) {
  if (size === 'fit') {
    const w = (imgW * 72) / FIT_DPI
    const h = (imgH * 72) / FIT_DPI
    return { pageW: w + margin * 2, pageH: h + margin * 2, x: margin, y: margin, w, h }
  }
  let [pageW, pageH] = PAGE_SIZES[size] ?? PAGE_SIZES.a4
  const landscape = orientation === 'landscape' || (orientation === 'auto' && imgW > imgH)
  if (landscape) [pageW, pageH] = [pageH, pageW]
  const boxW = Math.max(1, pageW - margin * 2)
  const boxH = Math.max(1, pageH - margin * 2)
  const scale = Math.min(boxW / imgW, boxH / imgH)
  const w = imgW * scale
  const h = imgH * scale
  return { pageW, pageH, x: (pageW - w) / 2, y: (pageH - h) / 2, w, h }
}

const tick = () => new Promise((r) => setTimeout(r, 0)) // let the UI paint between pages

/**
 * Build a multi-page PDF from scan pages: [{ blob, settings }].
 * options: { title, size, orientation, margin, quality }, onProgress(done, total)
 */
export async function buildScanPdf(pages, options, onProgress, signal) {
  const q = QUALITY[options.quality] ?? QUALITY.medium
  const margin = MARGINS[options.margin] ?? 0
  const pdf = await PDFDocument.create()
  pdf.setTitle(options.title || 'Scan')
  pdf.setProducer('SmartScan Pro')
  pdf.setCreator('SmartScan Pro')

  for (let i = 0; i < pages.length; i++) {
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
    onProgress?.(i, pages.length)
    await tick()
    const bitmap = await decodeBlob(pages[i].blob)
    const canvas = renderPage(bitmap, pages[i].settings, q.maxSide)
    bitmap.close?.()
    const jpeg = await canvasToBlob(canvas, q.jpeg)
    const img = await pdf.embedJpg(await jpeg.arrayBuffer())
    const L = computeLayout(canvas.width, canvas.height, { ...options, margin })
    const page = pdf.addPage([L.pageW, L.pageH])
    page.drawImage(img, { x: L.x, y: L.y, width: L.w, height: L.h })
    canvas.width = canvas.height = 0 // release memory sooner
  }
  onProgress?.(pages.length, pages.length)
  const bytes = await pdf.save()
  return new Blob([bytes], { type: 'application/pdf' })
}
