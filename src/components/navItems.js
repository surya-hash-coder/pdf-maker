import { Camera, Clock, FileOutput, House, Languages, Settings, Wrench } from 'lucide-react'

export const NAV = [
  { to: '/app', label: 'Dashboard', icon: House, end: true },
  { to: '/app/scan', label: 'Scan', icon: Camera },
  { to: '/app/tools', label: 'PDF tools', icon: Wrench },
  { to: '/app/convert', label: 'Convert', icon: FileOutput },
  { to: '/app/ocr', label: 'OCR', icon: Languages },
  { to: '/app/recent', label: 'Recent', icon: Clock },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]
