export function cameraSupport() {
  if (typeof window === 'undefined') return { ok: false, reason: 'unsupported' }
  if (!window.isSecureContext) return { ok: false, reason: 'insecure' }
  if (!navigator.mediaDevices?.getUserMedia) return { ok: false, reason: 'unsupported' }
  return { ok: true }
}

/** Maps getUserMedia errors to messages a person can act on. */
export function describeCameraError(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return { code: 'denied', message: 'Camera access was blocked. Allow the camera for this site in your browser settings, then try again. You can also upload photos instead.' }
    case 'NotFoundError':
    case 'OverconstrainedError':
      return { code: 'notfound', message: 'No camera was found on this device. Upload photos of your pages instead.' }
    case 'NotReadableError':
    case 'AbortError':
      return { code: 'busy', message: 'The camera is in use by another app or tab. Close it there and try again.' }
    default:
      return { code: 'error', message: `The camera could not start${err?.message ? ` (${err.message})` : ''}.` }
  }
}

export async function startStream({ deviceId, facingMode = 'environment' } = {}) {
  const video = {
    width: { ideal: 3840 },
    height: { ideal: 2160 },
    ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: facingMode } }),
  }
  return navigator.mediaDevices.getUserMedia({ video, audio: false })
}

export function stopStream(stream) {
  stream?.getTracks().forEach((t) => t.stop())
}

export async function listCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices()
  return devices.filter((d) => d.kind === 'videoinput')
}

export function supportsTorch(stream) {
  const track = stream?.getVideoTracks()[0]
  const caps = track?.getCapabilities?.()
  return Boolean(caps && 'torch' in caps)
}

export async function setTorch(stream, on) {
  const track = stream?.getVideoTracks()[0]
  await track.applyConstraints({ advanced: [{ torch: on }] })
}

/** Grab the current video frame as a JPEG blob at the camera's native resolution. */
export function captureFrame(video, quality = 0.95) {
  const w = video.videoWidth
  const h = video.videoHeight
  if (!w || !h) return Promise.reject(new Error('The camera is not ready yet.'))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(video, 0, 0, w, h)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve({ blob: b, width: w, height: h }) : reject(new Error('Capture failed.'))), 'image/jpeg', quality),
  )
}
