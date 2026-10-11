import { useCallback, useEffect, useRef, useState } from 'react'
import { ImagePlus, RefreshCw } from 'lucide-react'
import CameraControls from './CameraControls.jsx'
import FileUploader from './FileUploader.jsx'
import { cameraSupport, captureFrame, describeCameraError, listCameras, setTorch, startStream, stopStream, supportsTorch } from '../utils/camera.js'

const SUPPORT_MESSAGES = {
  insecure: 'Camera access needs a secure connection (HTTPS). It works on localhost while developing, but not on a plain http:// address.',
  unsupported: 'This browser does not support camera access. Upload photos of your pages instead.',
}

export default function CameraScanner({ pageCount, onCapture, onUpload, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus] = useState('starting') // starting | ready | error
  const [error, setError] = useState(null)
  const [devices, setDevices] = useState([])
  const [request, setRequest] = useState({ deviceId: null, facingMode: 'environment', attempt: 0 })
  const [activeId, setActiveId] = useState(null)
  const [torchAvailable, setTorchAvailable] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState(false)
  const [announce, setAnnounce] = useState('')

  const support = cameraSupport()

  // Start (or restart) the stream. The cleanup always stops every track, including on unmount.
  useEffect(() => {
    if (!support.ok) return undefined
    let cancelled = false
    let stream = null
    setStatus('starting')
    setError(null)
    ;(async () => {
      try {
        stream = await startStream(request.deviceId ? { deviceId: request.deviceId } : { facingMode: request.facingMode })
        if (cancelled) { stopStream(stream); return }
        streamRef.current = stream
        const video = videoRef.current
        video.srcObject = stream
        await video.play()
        if (cancelled) return
        setActiveId(stream.getVideoTracks()[0].getSettings().deviceId ?? null)
        setTorchAvailable(supportsTorch(stream))
        setTorchOn(false)
        setStatus('ready')
        const cams = await listCameras() // labels are only available after permission is granted
        if (!cancelled) setDevices(cams)
      } catch (e) {
        if (!cancelled) { setError(describeCameraError(e)); setStatus('error') }
      }
    })()
    return () => {
      cancelled = true
      stopStream(stream)
      stopStream(streamRef.current)
      streamRef.current = null
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [request, support.ok])

  const shutter = useCallback(async () => {
    if (busy || status !== 'ready') return
    setBusy(true)
    try {
      const shot = await captureFrame(videoRef.current)
      onCapture([{ ...shot, source: 'camera' }])
      setFlash(true)
      setTimeout(() => setFlash(false), 140)
      setAnnounce(`Page ${pageCount + 1} captured`)
    } catch (e) {
      setError({ code: 'capture', message: e.message })
    } finally {
      setBusy(false)
    }
  }, [busy, status, onCapture, pageCount])

  const switchCamera = () => {
    if (devices.length < 2) return
    const i = devices.findIndex((d) => d.deviceId === activeId)
    const next = devices[(i + 1) % devices.length]
    setRequest((r) => ({ ...r, deviceId: next.deviceId, attempt: r.attempt + 1 }))
  }

  const toggleTorch = async () => {
    try {
      await setTorch(streamRef.current, !torchOn)
      setTorchOn(!torchOn)
    } catch {
      setTorchAvailable(false)
    }
  }

  // Fallback UI: unsupported / insecure / denied / error
  if (!support.ok || status === 'error') {
    const message = !support.ok ? SUPPORT_MESSAGES[support.reason] : error?.message
    return (
      <div className="card p-6" role="alert">
        <h2 className="text-lg font-semibold">Camera unavailable</h2>
        <p className="mt-2 text-ink-soft">{message}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {support.ok && <button className="btn btn-primary" onClick={() => setRequest((r) => ({ ...r, attempt: r.attempt + 1 }))}><RefreshCw size={18} aria-hidden="true" /> Try again</button>}
          <FileUploader compact onFiles={onUpload} />
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-[3/4] max-h-[68vh] w-full bg-ink sm:aspect-video">
        <video ref={videoRef} playsInline muted className="size-full object-contain" aria-label="Live camera preview" />
        {status === 'starting' && <div className="absolute inset-0 grid place-items-center text-white" role="status">Starting camera…</div>}
        {status === 'ready' && (
          <div className="pointer-events-none absolute inset-[8%]" aria-hidden="true">
            {['left-0 top-0 border-l-4 border-t-4', 'right-0 top-0 border-r-4 border-t-4', 'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'].map((c) => (
              <span key={c} className={`absolute size-8 rounded-sm border-white/90 ${c}`} />
            ))}
          </div>
        )}
        {flash && <div className="absolute inset-0 bg-white/80" aria-hidden="true" />}
        <p className="absolute inset-x-0 bottom-2 text-center text-xs text-white/80">Fill the frame with the page and hold steady</p>
      </div>
      <div className="p-4">
        <CameraControls
          ready={status === 'ready'} busy={busy} pageCount={pageCount} devices={devices} activeId={activeId}
          onSelect={(id) => setRequest((r) => ({ ...r, deviceId: id, attempt: r.attempt + 1 }))}
          onSwitch={switchCamera} torchAvailable={torchAvailable} torchOn={torchOn} onTorch={toggleTorch}
          onShutter={shutter} onDone={onClose}
        />
        <div className="mt-3 flex items-center gap-2 text-sm text-ink-soft"><ImagePlus size={16} aria-hidden="true" /> <FileUploader compact onFiles={onUpload} /></div>
        <p className="sr-only" aria-live="polite">{announce}</p>
      </div>
    </div>
  )
}
