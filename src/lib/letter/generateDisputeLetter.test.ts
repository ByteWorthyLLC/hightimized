import { describe, test, expect } from 'vitest'
import { generateDisputeLetter, FlaggedLine } from './generateDisputeLetter'

const sample: FlaggedLine = {
  cptCode: '99213',
  description: 'Office visit, est. patient, low complexity',
  charged: 750.0,
  publishedRate: 187.5,
  multiplier: 4.0,
}

describe('generateDisputeLetter', () => {
  test('returns a Uint8Array', async () => {
    const bytes = await generateDisputeLetter([sample])
    expect(bytes).toBeInstanceOf(Uint8Array)
  })

  test('starts with PDF magic bytes (%PDF)', async () => {
    const bytes = await generateDisputeLetter([sample])
    expect(Array.from(bytes.subarray(0, 4))).toEqual([0x25, 0x50, 0x44, 0x46])
  })

  test('byte length is greater than 1500 (real multi-paragraph letter)', async () => {
    const bytes = await generateDisputeLetter([sample])
    expect(bytes.byteLength).toBeGreaterThan(1500)
  })

  test('renders content for multiple flagged lines (output grows with more lines)', async () => {
    const second: FlaggedLine = {
      cptCode: '85025',
      description: 'Complete blood count w/ differential',
      charged: 80.0,
      publishedRate: 15.0,
      multiplier: 5.33,
    }
    const single = await generateDisputeLetter([sample])
    const dual = await generateDisputeLetter([sample, second])
    // pdf-lib deduplicates fonts/objects; real delta is ~130 bytes per added flagged line
    expect(dual.byteLength).toBeGreaterThan(single.byteLength + 100)
  })
})
