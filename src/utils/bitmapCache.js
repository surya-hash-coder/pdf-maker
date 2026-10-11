// Decoded originals are cached per blob so slider changes don't re-decode the image.
const cache = new Map()

export async function getBitmap(blob) {
  if (!cache.has(blob)) cache.set(blob, createImageBitmap(blob))
  return cache.get(blob)
}

export function releaseBitmap(blob) {
  const p = cache.get(blob)
  if (p) p.then((b) => b.close?.()).catch(() => {})
  cache.delete(blob)
}
