import { useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { ACCEPT_ATTR, validateImageFiles } from '../utils/fileValidation.js'

/** Drag-and-drop zone plus a file picker. Reports valid files and a list of human-readable errors. */
export default function FileUploader({ onFiles, compact = false, busy = false }) {
  const inputRef = useRef(null)
  const [over, setOver] = useState(false)
  const [errors, setErrors] = useState([])

  const handle = (fileList) => {
    const { valid, errors: errs } = validateImageFiles(fileList)
    setErrors(errs)
    if (valid.length) onFiles(valid)
  }

  const input = (
    <input ref={inputRef} type="file" multiple accept={ACCEPT_ATTR} className="sr-only" aria-label="Choose images to scan"
      onChange={(e) => { handle(e.target.files); e.target.value = '' }} />
  )

  if (compact) {
    return (
      <>
        {input}
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => inputRef.current?.click()}>
          <ImagePlus size={18} aria-hidden="true" /> Add photos
        </button>
        {errors.length > 0 && <ul role="alert" className="mt-2 text-sm text-danger">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
      </>
    )
  }

  return (
    <div>
      {input}
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files) }}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${over ? 'border-brand bg-brand-tint' : 'border-line bg-white'}`}
      >
        <ImagePlus className="mx-auto text-brand" size={32} aria-hidden="true" />
        <p className="mt-3 font-semibold">Drop page photos here</p>
        <p className="mt-1 text-sm text-ink-soft">JPG, PNG or WebP, up to 25 MB each. Files stay on this device.</p>
        <button type="button" className="btn btn-primary mt-4" disabled={busy} onClick={() => inputRef.current?.click()}>Choose images</button>
      </div>
      {errors.length > 0 && <ul role="alert" className="mt-3 space-y-1 text-sm text-danger">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
    </div>
  )
}
