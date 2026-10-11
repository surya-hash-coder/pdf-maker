import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import MobileNavigation from '../components/MobileNavigation.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'

export default function AppLayout() {
  return (
    <div className="flex min-h-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNavigation.Top />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 lg:px-8 lg:py-10 lg:pb-10">
          <ErrorBoundary><Outlet /></ErrorBoundary>
        </main>
        <MobileNavigation />
      </div>
    </div>
  )
}
