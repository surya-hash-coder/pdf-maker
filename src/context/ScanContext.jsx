import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DEFAULT_SETTINGS } from '../utils/imageEnhance.js'
import { releaseBitmap } from '../utils/bitmapCache.js'

const ScanContext = createContext(null)
let counter = 0
const newId = () => `p${Date.now().toString(36)}${(counter++).toString(36)}`

/** Holds the current scan session in memory. Pages are lost on reload; the scanner warns before that happens. */
export function ScanProvider({ children }) {
  const [pages, setPages] = useState([])

  const addPages = useCallback((items) => {
    const created = items.map((it) => ({
      id: newId(),
      blob: it.blob,
      width: it.width,
      height: it.height,
      source: it.source ?? 'upload',
      settings: { ...DEFAULT_SETTINGS },
    }))
    setPages((p) => [...p, ...created])
    return created
  }, [])

  const updateSettings = useCallback((id, patch) => {
    setPages((p) => p.map((pg) => (pg.id === id ? { ...pg, settings: { ...pg.settings, ...patch } } : pg)))
  }, [])

  const removePage = useCallback((id) => {
    setPages((p) => {
      const gone = p.find((pg) => pg.id === id)
      if (gone) releaseBitmap(gone.blob)
      return p.filter((pg) => pg.id !== id)
    })
  }, [])

  const movePage = useCallback((from, to) => {
    setPages((p) => {
      if (from === to || to < 0 || to >= p.length) return p
      const next = p.slice()
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }, [])

  const clearPages = useCallback(() => {
    setPages((p) => {
      p.forEach((pg) => releaseBitmap(pg.blob))
      return []
    })
  }, [])

  const value = useMemo(
    () => ({ pages, addPages, updateSettings, removePage, movePage, clearPages }),
    [pages, addPages, updateSettings, removePage, movePage, clearPages],
  )
  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>
}

export function useScan() {
  const ctx = useContext(ScanContext)
  if (!ctx) throw new Error('useScan must be used inside <ScanProvider>')
  return ctx
}
