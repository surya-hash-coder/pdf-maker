export const MAX_IMAGE_BYTES = 25 * 1024 * 1024 // 25 MB per image
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'

const EXT_OK = /\.(jpe?g|png|webp)$/i

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

/** Returns { valid: File[], errors: string[] }. Content is verified later when the image is decoded. */
export function validateImageFiles(fileList) {
  const valid = []
  const errors = []
  for (const file of Array.from(fileList)) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || !EXT_OK.test(file.name)) {
      errors.push(`${file.name}: only JPG, PNG, and WebP images are supported here.`)
    } else if (file.size === 0) {
      errors.push(`${file.name}: the file is empty.`)
    } else if (file.size > MAX_IMAGE_BYTES) {
      errors.push(`${file.name}: ${formatBytes(file.size)} is over the ${formatBytes(MAX_IMAGE_BYTES)} limit.`)
    } else {
      valid.push(file)
    }
  }
  return { valid, errors }
}
