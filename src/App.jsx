import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { ScanProvider } from './context/ScanContext.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Scanner from './pages/Scanner.jsx'
import PhasePage from './pages/PhasePage.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

export default function App() {
  return (
    <ErrorBoundary>
      <ScanProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="scan" element={<Scanner />} />
              <Route path="tools" element={<PhasePage title="PDF tools" phase="Phase 4" description="Merge, split, extract, reorder, delete, rotate, page numbers, watermarks, and PDF-to-image." />} />
              <Route path="convert" element={<PhasePage title="Convert documents" phase="Phase 4" description="Image, text, DOCX and PDF conversions using real parsers. Some conversions will need the optional backend." />} />
              <Route path="ocr" element={<PhasePage title="OCR" phase="Phase 3" description="Tesseract.js text recognition, an editable text workspace, TXT/DOCX export and searchable PDFs." />} />
              <Route path="recent" element={<PhasePage title="Recent documents" phase="Phase 5" description="IndexedDB-backed document history with clear retention and delete controls." />} />
              <Route path="settings" element={<PhasePage title="Settings" phase="Phase 5" description="Privacy controls, storage management and defaults." />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ScanProvider>
    </ErrorBoundary>
  )
}
