import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import App from './App'

// vi.hoisted runs before vi.mock hoisting — variables declared here are safe
// to reference inside vi.mock factory functions.
const { mockLookupChargemaster, generateDisputeLetterMock, mockGetChargemasterDb } = vi.hoisted(
  () => {
    const mockLookupChargemaster = vi.fn((_: unknown, cptCode: string) => {
      if (cptCode === '99213') {
        return {
          cpt_code: '99213',
          description: 'Office visit, est. patient, low complexity',
          hospital_published_rate: 187.5,
          regional_median: 198.0,
          medicare_allowable: 92.4,
        }
      }
      return null
    })
    const mockGetChargemasterDb = vi.fn().mockResolvedValue({})
    const generateDisputeLetterMock = vi
      .fn()
      .mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46]))
    return { mockLookupChargemaster, generateDisputeLetterMock, mockGetChargemasterDb }
  },
)

// Mock the OCR module — no WASM in tests
vi.mock('./lib/ocr/ocrPdf', () => ({
  ocrFirstPageOfPdf: vi
    .fn()
    .mockResolvedValue(
      '99213   Office visit, est. patient, low complexity   $750.00\n' +
        '85025   Complete blood count w/ diff                  $80.00\n' +
        'J3490   Unclassified injection                       $200.00',
    ),
}))

// Mock the chargemaster DB module — no sql.js WASM in tests
vi.mock('./data-sources/chargemasterDb', () => ({
  getChargemasterDb: mockGetChargemasterDb,
  lookupChargemaster: mockLookupChargemaster,
}))

// Mock generateDisputeLetter — no pdf-lib in integration tests
vi.mock('./lib/letter/generateDisputeLetter', () => ({
  generateDisputeLetter: generateDisputeLetterMock,
}))

// Mock URL.createObjectURL and URL.revokeObjectURL — not implemented in jsdom
const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url')
const mockRevokeObjectURL = vi.fn()
globalThis.URL.createObjectURL = mockCreateObjectURL
globalThis.URL.revokeObjectURL = mockRevokeObjectURL

function createDropEvent(files: File[]) {
  return {
    dataTransfer: {
      files,
      items: files.map((f) => ({
        kind: 'file',
        type: f.type,
        getAsFile: () => f,
      })),
      types: ['Files'],
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  // Re-apply URL mocks after clearAllMocks resets them
  mockCreateObjectURL.mockReturnValue('blob:mock-url')
  globalThis.URL.createObjectURL = mockCreateObjectURL
  globalThis.URL.revokeObjectURL = mockRevokeObjectURL
  // Re-apply chargemaster lookup impl after clearAllMocks resets it
  mockGetChargemasterDb.mockResolvedValue({})
  mockLookupChargemaster.mockImplementation((_: unknown, cptCode: string) => {
    if (cptCode === '99213') {
      return {
        cpt_code: '99213',
        description: 'Office visit, est. patient, low complexity',
        hospital_published_rate: 187.5,
        regional_median: 198.0,
        medicare_allowable: 92.4,
      }
    }
    return null
  })
  generateDisputeLetterMock.mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46]))
})

describe('App', () => {
  it('renders PrivacyBanner copy, DropZone heading, no GenerateLetterButton initially', () => {
    render(<App />)
    expect(
      screen.getByText('Your data never leaves your device. No upload, no account.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Drop your hospital bill here/i }),
    ).toBeInTheDocument()
    // GenerateLetterButton should not be mounted before any file is dropped
    expect(
      screen.queryByRole('button', { name: /Generate dispute letter|No overcharges/i }),
    ).toBeNull()
  })

  it('happy path: drop PDF, see flagged 99213 row with 4.0× badge, CTA enabled', async () => {
    render(<App />)
    const file = new File(['%PDF-1.4'], 'bill.pdf', { type: 'application/pdf' })
    const dropZone = screen.getByRole('button', {
      name: /Drop your hospital bill here/i,
    })
    fireEvent.drop(dropZone, createDropEvent([file]))

    await screen.findByText(/99213/)
    // FlagBadge has role="status" and contains the multiplier — use getAllByText
    // since TraceDetail also shows "Multiplier: 4.0×" when expanded
    const flagBadge = await screen.findByRole('status', { name: /4\.0 times/i })
    expect(flagBadge).toBeInTheDocument()
    await screen.findByRole('button', { name: /Generate dispute letter PDF and download/i })
  })

  it('wrong type: drop JPG, ToastError appears with correct copy', async () => {
    render(<App />)
    const file = new File(['data'], 'bill.jpg', { type: 'image/jpeg' })
    const dropZone = screen.getByRole('button', {
      name: /Drop your hospital bill here/i,
    })
    fireEvent.drop(dropZone, createDropEvent([file]))

    await screen.findByRole('alert')
    expect(screen.getByText('File not supported.')).toBeInTheDocument()
    expect(screen.getByText(/Drop a PDF/)).toBeInTheDocument()
  })

  it('CTA click invokes generateDisputeLetter after audited state', async () => {
    const user = userEvent.setup()
    render(<App />)
    const file = new File(['%PDF-1.4'], 'bill.pdf', { type: 'application/pdf' })
    const dropZone = screen.getByRole('button', {
      name: /Drop your hospital bill here/i,
    })
    fireEvent.drop(dropZone, createDropEvent([file]))

    const cta = await screen.findByRole('button', {
      name: /Generate dispute letter PDF and download/i,
    })
    await user.click(cta)
    expect(generateDisputeLetterMock).toHaveBeenCalled()
  })
})
