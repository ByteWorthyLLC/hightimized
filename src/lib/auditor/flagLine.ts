import type { ChargemasterRow } from '../../data-sources/chargemasterDb'
export type { ChargemasterRow }

export interface FlagResult {
  rule: 'charge_exceeds_1_5x_published_rate'
  charged: number
  comparisonRate: number
  multiplier: number
  plainEnglishMultiplier: string
}

const THRESHOLD = 1.5

const WHOLE_NUMBERS = [
  '',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
]

function toEnglishMultiplier(n: number): string {
  const rounded = Math.round(n)
  if (Math.abs(n - rounded) < 0.05 && rounded > 0 && rounded < WHOLE_NUMBERS.length) {
    return WHOLE_NUMBERS[rounded]
  }
  return (Math.round(n * 10) / 10).toString()
}

export function flagLine(charge: number, row: ChargemasterRow): FlagResult | null {
  if (charge > THRESHOLD * row.hospital_published_rate) {
    const multiplier = charge / row.hospital_published_rate
    return {
      rule: 'charge_exceeds_1_5x_published_rate',
      charged: charge,
      comparisonRate: row.hospital_published_rate,
      multiplier: Math.round(multiplier * 10) / 10,
      plainEnglishMultiplier: toEnglishMultiplier(multiplier),
    }
  }
  return null
}
