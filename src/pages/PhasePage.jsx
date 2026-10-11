import { Link } from 'react-router-dom'

export default function PhasePage({ title, phase, description }) {
  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="card mt-6 p-6">
        <p className="font-semibold">Not built yet — planned for {phase}.</p>
        <p className="mt-2 text-ink-soft">{description}</p>
        <Link to="/app/scan" className="btn btn-primary mt-5">Go to the scanner</Link>
      </div>
    </div>
  )
}
