import { describe, test, expect } from 'vitest'
import { flagLine } from './flagLine'
import type { ChargemasterRow } from '../../data-sources/chargemasterDb'

const mockRow: ChargemasterRow = {
  cpt_code: '99213',
  description: 'Office visit, est. patient, low complexity',
  hospital_published_rate: 187.5,
  regional_median: 198.0,
  medicare_allowable: 92.4,
}

describe('flagLine', () => {
  test('flags 99213 at $750 — 4x rate', () => {
    const result = flagLine(750.0, mockRow)
    expect(result).not.toBeNull()
    expect(result!.multiplier).toBe(4.0)
    expect(result!.plainEnglishMultiplier).toBe('FOUR')
    expect(result!.rule).toBe('charge_exceeds_1_5x_published_rate')
    expect(result!.charged).toBe(750.0)
    expect(result!.comparisonRate).toBe(187.5)
  })

  test('does not flag at exactly 1.5x rate', () => {
    // 187.5 * 1.5 = 281.25 — strict greater-than, not >=
    expect(flagLine(187.5 * 1.5, mockRow)).toBeNull()
  })

  test('flags at 1.5x + 0.01', () => {
    expect(flagLine(187.5 * 1.5 + 0.01, mockRow)).not.toBeNull()
  })

  test('uses decimal string for non-whole multipliers', () => {
    // 431.25 / 187.5 = 2.3
    const result = flagLine(431.25, mockRow)
    expect(result).not.toBeNull()
    expect(result!.plainEnglishMultiplier).toBe('2.3')
  })
})
