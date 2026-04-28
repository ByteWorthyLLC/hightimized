import { describe, test, expect, vi, beforeEach } from 'vitest'

const recognizeMock = vi.fn()
const terminateMock = vi.fn().mockResolvedValue(undefined)
let capturedLogger: ((m: { status: string; progress: number }) => void) | undefined

vi.mock('tesseract.js', () => ({
  createWorker: vi.fn(
    async (
      _lang: string,
      _oem: number,
      opts: { logger?: (m: { status: string; progress: number }) => void },
    ) => {
      capturedLogger = opts?.logger
      return {
        recognize: recognizeMock,
        terminate: terminateMock,
      }
    },
  ),
}))

vi.mock('pdfjs-dist', () => {
  const renderPromise = { promise: Promise.resolve() }
  const fakePage = {
    getViewport: () => ({ width: 600, height: 800 }),
    render: () => renderPromise,
  }
  const fakeDoc = { getPage: () => Promise.resolve(fakePage) }
  return {
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: () => ({ promise: Promise.resolve(fakeDoc) }),
  }
})

describe('ocrFirstPageOfPdf', () => {
  beforeEach(() => {
    recognizeMock.mockReset()
    terminateMock.mockClear()
    capturedLogger = undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => ({}) as CanvasRenderingContext2D,
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext
  })

  test('returns OCR text on success', async () => {
    recognizeMock.mockResolvedValue({ data: { text: 'hello world' } })
    const { ocrFirstPageOfPdf } = await import('./ocrPdf')
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'bill.pdf', {
      type: 'application/pdf',
    })
    const result = await ocrFirstPageOfPdf(file)
    expect(result).toBe('hello world')
    expect(terminateMock).toHaveBeenCalled()
  })

  test('forwards progress events while recognizing text', async () => {
    recognizeMock.mockImplementation(async () => {
      capturedLogger?.({ status: 'recognizing text', progress: 0.5 })
      return { data: { text: 'partial' } }
    })
    const onProgress = vi.fn()
    const { ocrFirstPageOfPdf } = await import('./ocrPdf')
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'bill.pdf', {
      type: 'application/pdf',
    })
    await ocrFirstPageOfPdf(file, onProgress)
    expect(onProgress).toHaveBeenCalledWith(0.5)
  })

  test('terminates the worker even when recognize rejects', async () => {
    recognizeMock.mockRejectedValue(new Error('boom'))
    const { ocrFirstPageOfPdf } = await import('./ocrPdf')
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'bill.pdf', {
      type: 'application/pdf',
    })
    await expect(ocrFirstPageOfPdf(file)).rejects.toThrow('boom')
    expect(terminateMock).toHaveBeenCalled()
  })
})
