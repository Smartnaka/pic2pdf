# Pic2PDF

Convert your images into a single PDF — fast, private, and entirely in your browser.

Pic2PDF is a lightweight React + Vite web app that lets you:
- Reorder images with drag-and-drop
- Choose scaling behavior (Fit/Contain vs Fill/Cover)
- Adjust image compression quality to shrink PDF size
- Set a custom output filename
- Export a clean, multi-page PDF

All processing happens locally in your browser using a Web Worker and jsPDF — your images never leave your device.

## Features
- Drag-and-drop image upload (JPG/PNG)
- Instant previews and easy removal
- Reorder images by dragging
- Quality slider to balance size vs clarity
- Client-side PDF generation via Web Worker
- Modern, responsive UI

## Tech Stack
- React 19 + TypeScript
- Vite 6
- Web Worker (`workers/pdf.worker.js`)
- jsPDF (via CDN inside the worker)

## Getting Started

Prerequisites: Node.js 18+ (or any current LTS)

1) Install dependencies:
```bash
npm install
```

2) Run the development server:
```bash
npm run dev
```

3) Open the app:
- Vite will print a local URL (typically `http://localhost:5173`)

## Usage
1) Drag and drop JPG/PNG files into the upload area (or click “Browse Files”)
2) Reorder images by dragging the cards
3) Choose scaling mode:
   - Contain: Fit the whole image within the page (may add margins)
   - Cover: Fill the page (may crop edges)
4) Adjust image quality to reduce file size (lower = smaller PDF)
5) Set the PDF filename
6) Click “Generate PDF” to download

## Build for Production
```bash
npm run build
npm run preview
```

This creates an optimized build in `dist/`. You can deploy the static files to any static host.

## Privacy
Pic2PDF runs fully in your browser. Images are processed locally using a Web Worker; no files are uploaded to a server.

## File Structure (key files)
- `App.tsx` — main UI and state
- `components/` — upload, preview, and controls
- `hooks/usePdfGenerator.ts` — PDF generation hook and worker orchestration
- `workers/pdf.worker.js` — jsPDF worker that composes the PDF
- `public/workers/pdf.worker.js` — public copy for production pathing

## License
MIT — feel free to use and modify.
