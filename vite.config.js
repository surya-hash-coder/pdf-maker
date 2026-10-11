import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Camera access needs a secure context: localhost works in dev,
// but a phone on your LAN needs HTTPS (see README: `npm run dev -- --host` + a tunnel or local cert).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: true },
})
