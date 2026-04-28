import { describe, test, expect } from 'vitest'
import type { Database } from 'sql.js'
import { lookupChargemaster } from './chargemasterDb'

type FakeRow = (string | number)[]

function fakeDb(rows: Record<string, FakeRow>): Database {
  return {
    exec: (_sql: string, params?: unknown[]) => {
      const key = Array.isArray(params) ? String(params[0]) : ''
      const row = rows[key]
      if (!row) return []
      return [
        {
          columns: [
            'cpt_code',
            'description',
            'hospital_published_rate',
            'regional_median',
            'medicare_allowable',
          ],
          values: [row],
        },
      ]
    },
  } as unknown as Database
}

describe('lookupChargemaster', () => {
  test('returns the seeded row for 99213', () => {
    const db = fakeDb({
      '99213': ['99213', 'Office visit, est. patient, low complexity', 187.5, 198.0, 92.4],
    })
    const result = lookupChargemaster(db, '99213')
    expect(result).toEqual({
      cpt_code: '99213',
      description: 'Office visit, est. patient, low complexity',
      hospital_published_rate: 187.5,
      regional_median: 198.0,
      medicare_allowable: 92.4,
    })
  })

  test('returns null for unknown codes', () => {
    const db = fakeDb({})
    expect(lookupChargemaster(db, 'NOPE0')).toBeNull()
  })
})
