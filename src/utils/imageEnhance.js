// Canvas-based scan pipeline: crop -> rotate -> scale -> filter -> brightness/contrast.
// Everything runs locally in the browser.

export const DEFAULT_SETTINGS = Object.freeze({
  crop: { x: 0, y: 0, w: 1, h: 1 }, // normalized to the original image
  rotation: 0, // degrees, multiples of 90
  filter: 'original', // original | enhanced | gray | bw
  brightness: 0, // -100..100
  contrast: 0, // -100..100
})

export const FILTERS = [
  { id: 'original', label: 'Original' },
  { id: 'enhanced', label: 'Enhanced' },
  { id: 'gray', label: 'Grayscale' },
  { id: 'bw', label: 'Black & white' },
]

const MAX_INGEST_SIDE = 4096

/** Decode an uploaded image, honour EXIF rotation, cap its size, and re-encode as JPEG. */
export async function ingestImageFile(file) {
  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error(`${file.name || 'This file'} could not be read as an image. It may be corrupted.`)
  }
  const scale = Math.min(1, MAX_INGEST_SIDE / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff' // flatten transparent PNG/WebP onto white
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.94))
  if (!blob) throw new Error('Could not process this image.')
  return { blob, width: w, height: h }
}

export async function decodeBlob(blob) {
  return createImageBitmap(blob)
}

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v)

function applyBrightnessContrast(data, brightness, contrast) {
  if (!brightness && !contrast) return
  const c = contrast * 2.55
  const factor = (259 * (c + 255)) / (255 * (259 - c))
  const shift = brightness * 2.55
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128 + shift)
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128 + shift)
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128 + shift)
  }
}

function toGray(data) {
  for (let i = 0; i < data.length; i += 4) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    data[i] = data[i + 1] = data[i + 2] = g
  }
}

/** Stretch the 1st–99th luminance percentile to full range: lifts grey paper toward white. */
function autoLevels(data) {
  const hist = new Uint32Array(256)
  const total = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    hist[Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])]++
  }
  let acc = 0, lo = 0, hi = 255
  for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * 0.01) { lo = v; break } }
  acc = 0
  for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc >= total * 0.01) { hi = v; break } }
  if (hi - lo < 20) return
  const scale = 255 / (hi - lo)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp((data[i] - lo) * scale)
    data[i + 1] = clamp((data[i + 1] - lo) * scale)
    data[i + 2] = clamp((data[i + 2] - lo) * scale)
  }
}

/** Adaptive (local-mean) threshold via an integral image: handles shadows and uneven lighting. */
function adaptiveThreshold(data, w, h, sensitivity = 0.1) {
  const gray = new Uint8ClampedArray(w * h)
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  const W = w + 1
  const integral = new Uint32Array(W * (h + 1))
  for (let y = 1; y <= h; y++) {
    let rowSum = 0
    for (let x = 1; x <= w; x++) {
      rowSum += gray[(y - 1) * w + (x - 1)]
      integral[y * W + x] = integral[(y - 1) * W + x] + rowSum
    }
  }
  const r = Math.max(8, Math.round(Math.min(w, h) / 24))
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1)
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1)
      const sum = integral[y1 * W + x1] - integral[y0 * W + x1] - integral[y1 * W + x0] + integral[y0 * W + x0]
      const mean = sum / ((x1 - x0) * (y1 - y0))
      const v = gray[y * w + x] < mean * (1 - sensitivity) ? 0 : 255
      const o = (y * w + x) * 4
      data[o] = data[o + 1] = data[o + 2] = v
    }
  }
}

/**
 * Render a page with its settings. `maxSide` caps the longest edge of the output.
 * Returns a canvas.
 */
export function renderPage(bitmap, settings, maxSide = 1600) {
  const s = { ...DEFAULT_SETTINGS, ...settings }
  const crop = s.crop
  const sx = Math.round(crop.x * bitmap.width)
  const sy = Math.round(crop.y * bitmap.height)
  const sw = Math.max(1, Math.round(crop.w * bitmap.width))
  const sh = Math.max(1, Math.round(crop.h * bitmap.height))
  const scale = Math.min(1, maxSide / Math.max(sw, sh))
  const dw = Math.max(1, Math.round(sw * scale))
  const dh = Math.max(1, Math.round(sh * scale))

  const rot = (((s.rotation % 360) + 360) % 360)
  const swap = rot === 90 || rot === 270
  const canvas = document.createElement('canvas')
  canvas.width = swap ? dh : dw
  canvas.height = swap ? dw : dh
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingQuality = 'high'
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rot * Math.PI) / 180)
  ctx.drawImage(bitmap, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh)
  ctx.setTransform(1, 0, 0, 1, 0, 0)

  if (s.filter !== 'original' || s.brightness || s.contrast) {
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const d = img.data
    if (s.filter === 'enhanced') autoLevels(d)
    if (s.filter === 'gray') toGray(d)
    applyBrightnessContrast(d, s.brightness, s.contrast)
    if (s.filter === 'bw') adaptiveThreshold(d, canvas.width, canvas.height, 0.1)
    ctx.putImageData(img, 0, 0)
  }
  return canvas
}

export function canvasToBlob(canvas, quality = 0.85) {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode the page image.'))), 'image/jpeg', quality),
  )
}
