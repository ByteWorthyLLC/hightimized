import { describe, test, expect } from 'vitest'
import { parseBillText } from './parseBillText'

const FIXTURE_OCR_TEXT = `MEMORIAL REGIONAL MEDICAL CENTER
123 Hospital Drive, Springfield, ST 00000
Patient Billing Office: (555) 000-0000

ITEMIZED STATEMENT
Patient: [PATIENT NAME]
Account: 000000000
Statement Date: 2024-03-15

CODE    DESCRIPTION                              CHARGE

99213   Office visit, est. patient, low complexity   $750.00
85025   Complete blood count w/ diff                  $80.00
J3490   Unclassified injection                       $200.00

TOTAL                                              $1,030.00
Please review this statement and contact billing with questions.`

describe('parseBillText', () => {
  test('extracts the three Phase 1 fixture line items', () => {
    const items = parseBillText(FIXTURE_OCR_TEXT)
    expect(items).toHaveLength(3)
    expect(items.map((i) => i.cptCode)).toEqual(['99213', '85025', 'J3490'])
  })

  test('parses CPT 99213 with trimmed description and numeric charge', () => {
    const items = parseBillText(FIXTURE_OCR_TEXT)
    expect(items[0]).toMatchObject({
      cptCode: '99213',
      description: 'Office visit, est. patient, low complexity',
      charge: 750.0,
    })
  })

  test('parses HCPCS Level II J3490', () => {
    const items = parseBillText(FIXTURE_OCR_TEXT)
    expect(items[2]).toMatchObject({ cptCode: 'J3490', charge: 200.0 })
  })

  test('handles charges with thousands commas', () => {
    const items = parseBillText('11111   Big procedure   $1,250.00')
    expect(items).toHaveLength(1)
    expect(items[0].charge).toBe(1250.0)
  })

  test('parses lines without leading dollar sign', () => {
    const items = parseBillText('99213   Office visit   750.00')
    expect(items[0].charge).toBe(750.0)
  })

  test('skips non-matching lines (headers, dividers, blanks)', () => {
    const items = parseBillText(FIXTURE_OCR_TEXT)
    expect(items.every((i) => /^([A-Z]\d{4}|\d{5})$/.test(i.cptCode))).toBe(true)
  })

  test('returns identical results on repeated calls (regex lastIndex reset)', () => {
    const first = parseBillText(FIXTURE_OCR_TEXT)
    const second = parseBillText(FIXTURE_OCR_TEXT)
    expect(second).toEqual(first)
  })
})
