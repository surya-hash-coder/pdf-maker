# SmartScan Pro

Vite + React document scanner. Phase 1–2 milestone: camera capture, page editing, multi-page PDF export.

## Run (Windows Command Prompt)

    cd smartscan-pro
    npm install
    npm run dev

Open http://localhost:5173 (camera works on localhost). Requires Node 22.13+.

## Test the PDF layout and output validity

    npm run test:pdf

## Camera on a phone

Browsers only allow the camera on HTTPS or localhost. To test on a phone, serve over HTTPS
(for example a tunnel such as `cloudflared tunnel --url http://localhost:5173`).

## Not built yet

Perspective correction / edge detection, OCR, PDF toolkit, conversions, IndexedDB history, settings.
"# pdf-maker" 
