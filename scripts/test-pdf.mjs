// Node test for the PDF layout maths and for pdf-lib output validity (no browser needed).
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PDFDocument } from 'pdf-lib'
import { computeLayout, PAGE_SIZES } from '../src/utils/pdfGenerate.js'

// pdfGenerate imports the canvas helpers, which are only touched inside buildScanPdf, so importing is safe.
const a4 = PAGE_SIZES.a4
let L = computeLayout(2000, 1000, { size: 'a4', orientation: 'portrait', margin: 0 })
assert.equal(L.pageW, a4[0]); assert.ok(Math.abs(L.w - a4[0]) < 1e-6, 'wide image fills width')
assert.ok(L.y > 0, 'wide image is vertically centred')

L = computeLayout(2000, 1000, { size: 'a4', orientation: 'auto', margin: 0 })
assert.equal(L.pageW, a4[1]); assert.equal(L.pageH, a4[0]) // auto -> landscape

L = computeLayout(1000, 1400, { size: 'letter', orientation: 'portrait', margin: 36 })
assert.ok(L.x >= 36 - 1e-6 && L.y >= 36 - 1e-6 && L.x + L.w <= 612 - 36 + 1e-6, 'respects margins')

L = computeLayout(1500, 1000, { size: 'fit', margin: 10 })
assert.equal(Math.round(L.pageW), Math.round(1500 * 72 / 150 + 20))

// Build a real 3-page PDF with embedded JPEGs and re-open it.
const jpeg = readFileSync(new URL('./fixture.jpg', import.meta.url))
const pdf = await PDFDocument.create()
for (let i = 0; i < 3; i++) {
  const img = await pdf.embedJpg(jpeg)
  const l = computeLayout(img.width, img.height, { size: 'a4', orientation: 'portrait', margin: 0 })
  const p = pdf.addPage([l.pageW, l.pageH])
  p.drawImage(img, { x: l.x, y: l.y, width: l.w, height: l.h })
}
const bytes = await pdf.save()
assert.equal(Buffer.from(bytes).subarray(0, 5).toString(), '%PDF-')
const reopened = await PDFDocument.load(bytes)
assert.equal(reopened.getPageCount(), 3)
console.log('PDF tests passed: layout maths + valid 3-page PDF (' + bytes.length + ' bytes)')
