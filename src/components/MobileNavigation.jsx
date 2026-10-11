import { Link, NavLink } from 'react-router-dom'
import { Settings } from 'lucide-react'
import Logo from './Logo.jsx'
import { NAV } from './navItems.js'

const BOTTOM = NAV.filter((n) => ['/app', '/app/scan', '/app/tools', '/app/ocr', '/app/recent'].includes(n.to))

function MobileNavigation() {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      {BOTTOM.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end}
          className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium ${isActive ? 'text-brand' : 'text-ink-soft'}`}>
          <Icon size={22} aria-hidden="true" /> {label}
        </NavLink>
      ))}
    </nav>
  )
}

MobileNavigation.Top = function Top() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
      <Logo to="/app" />
      <Link to="/app/settings" aria-label="Settings" className="grid size-10 place-items-center rounded-lg text-ink-soft"><Settings size={20} aria-hidden="true" /></Link>
    </header>
  )
}

export default MobileNavigation
