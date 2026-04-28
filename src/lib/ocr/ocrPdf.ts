import * as pdfjs from 'pdfjs-dist'
import { createWorker } from 'tesseract.js'

// Set worker URL once at module scope — resolves correctly in both dev and prod builds
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const BASE = import.meta.env.BASE_URL

export async function ocrFirstPageOfPdf(
  pdfFile: File,
  onProgress?: (p: number) => void,
): Promise<string> {
  // Step 1: PDF byte stream → canvas
  const buffer = await pdfFile.arrayBuffer()
  const pdfDoc = await pdfjs.getDocument({ data: buffer }).promise
  const page = await pdfDoc.getPage(1) // Phase 1: page 1 only — multi-page is OCR-03 (Phase 2)
  const viewport = page.getViewport({ scale: 2.0 }) // 2x for OCR accuracy

  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to acquire 2D canvas context')

  await page.render({ canvas, canvasContext: ctx, viewport }).promise

  // Step 2: canvas → OCR text via self-hosted tesseract worker
  // All asset URLs resolve through BASE_URL so the production GitHub Pages
  // base path (/hightimized/) is honored — no network calls leave the browser
  const worker = await createWorker('eng', 1, {
    workerPath: `${BASE}tesseract/worker.min.js`,
    langPath: `${BASE}tesseract/lang`,
    corePath: `${BASE}tesseract/`, // directory, NOT a specific .js file — library auto-selects SIMD variant
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(m.progress as number)
      }
    },
  })

  try {
    const {
      data: { text },
    } = await worker.recognize(canvas)
    return text
  } finally {
    // Always terminate — prevents worker leak if recognize() rejects
    await worker.terminate()
  }
}
