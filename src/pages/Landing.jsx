import { Link } from 'react-router-dom'
import { Camera, FileText, ShieldCheck } from 'lucide-react'
import Logo from '../components/Logo.jsx'

export default function Landing() {
  return (
    <div className="min-h-full bg-ink text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo light />
        <Link to="/app" className="btn bg-white text-ink hover:bg-mist">Open app</Link>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-12 lg:grid-cols-2">
        <div>
          <h1 className="text-5xl font-bold leading-[1.05] sm:text-6xl">Turn paper into clean PDFs with your camera.</h1>
          <p className="mt-6 max-w-lg text-lg text-white/75">Capture pages, straighten and brighten them, and export a multi-page PDF. Everything happens in your browser, so your documents stay on your device.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/app/scan?camera=1" className="btn btn-primary !min-h-12"><Camera size={20} aria-hidden="true" /> Start scanning</Link>
            <Link to="/app/scan" className="btn !min-h-12 border border-white/30 text-white hover:bg-white/10">Upload photos</Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
          <div className="aspect-[3/4] rounded-xl bg-white p-6 text-ink shadow-2xl [transform:rotate(-3deg)]">
            <div className="h-4 w-2/3 rounded bg-ink" />
            {[90, 100, 84, 96, 70, 100, 88, 60].map((w, i) => <div key={i} className="mt-3 h-2 rounded bg-line" style={{ width: `${w}%` }} />)}
          </div>
          {['left-[-14px] top-[-14px] border-l-4 border-t-4', 'right-[-14px] top-[-14px] border-r-4 border-t-4', 'bottom-[-14px] left-[-14px] border-b-4 border-l-4', 'bottom-[-14px] right-[-14px] border-b-4 border-r-4'].map((c) => (
            <span key={c} className={`absolute size-10 rounded-sm border-[#7c8cff] ${c}`} />
          ))}
        </div>
      </section>
      <section className="border-t border-white/10 bg-white text-ink">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-3">
          {[
            [Camera, 'Multi-page capture', 'Use the rear camera, add pages as you go, and reorder them before exporting.'],
            [FileText, 'Real PDF output', 'Choose A4, Letter or fit-to-image, set margins, and preview the file before you download it.'],
            [ShieldCheck, 'Local by default', 'Scanning and PDF creation run on your device. Nothing is uploaded.'],
          ].map(([Icon, title, text]) => (
            <div key={title}>
              <Icon className="text-brand" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-semibold">{title}</h2>
              <p className="mt-1 text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
