import { NavLink } from 'react-router-dom'
import Logo from './Logo.jsx'
import { NAV } from './navItems.js'

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-white p-4 lg:flex">
      <div className="px-2 py-3"><Logo to="/app" /></div>
      <nav aria-label="Main" className="mt-4 flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-[.95rem] font-medium ${isActive ? 'bg-brand-tint text-brand-dark' : 'text-ink-soft hover:bg-mist'}`}>
            <Icon size={19} aria-hidden="true" /> {label}
          </NavLink>
        ))}
      </nav>
      <p className="mt-auto px-2 text-xs text-ink-soft">Your files are processed in this browser and are not uploaded.</p>
    </aside>
  )
}
