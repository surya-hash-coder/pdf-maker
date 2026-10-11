import { useEffect, useState } from 'react'
import { getBitmap } from '../utils/bitmapCache.js'
import { renderPage, canvasToBlob } from '../utils/imageEnhance.js'

/** Renders a page with its settings to an object URL. Debounced so sliders stay smooth. */
export function usePagePreview(page, maxSide = 1400, delay = 60) {
  const [state, setState] = useState({ url: null, loading: true, error: null })
  const settingsKey = page ? JSON.stringify(page.settings) : ''
  const blob = page?.blob

  useEffect(() => {
    if (!blob) return undefined
    let cancelled = false
    let url = null
    setState((s) => ({ ...s, loading: true }))
    const timer = setTimeout(async () => {
      try {
        const bitmap = await getBitmap(blob)
        if (cancelled) return
        const canvas = renderPage(bitmap, JSON.parse(settingsKey), maxSide)
        const out = await canvasToBlob(canvas, 0.85)
        if (cancelled) return
        url = URL.createObjectURL(out)
        setState({ url, loading: false, error: null })
      } catch (e) {
        if (!cancelled) setState({ url: null, loading: false, error: e.message })
      }
    }, delay)
    return () => {
      cancelled = true
      clearTimeout(timer)
      if (url) URL.revokeObjectURL(url)
    }
  }, [blob, settingsKey, maxSide, delay])

  return state
}

export function useObjectUrl(blob) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    if (!blob) return undefined
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}
