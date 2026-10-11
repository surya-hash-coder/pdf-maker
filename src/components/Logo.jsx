import { Link } from 'react-router-dom'

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className={`flex items-center gap-2 font-display text-lg font-bold ${light ? 'text-white' : 'text-ink'}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#4f46e5"/><path d="M9 12V9h3M20 9h3v3M23 20v3h-3M12 23H9v-3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><rect x="12" y="12" width="8" height="8" rx="1.5" fill="#fff"/></svg>
      SmartScan Pro
    </Link>
  )
}
