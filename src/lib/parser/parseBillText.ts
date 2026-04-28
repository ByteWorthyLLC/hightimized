// src/lib/parser/parseBillText.ts

export interface LineItem {
  cptCode: string
  description: string
  charge: number
  rawLine: string
}

/**
 * Phase 1 line-item parser. Pure regex.
 *
 * Matches:
 *   99213   Office visit, est. patient, low complexity   $750.00
 *   J3490   Unclassified injection                       $200.00
 *
 * Phase 2 will add fuzzy matching and manual correction (OCR-04).
 */
const LINE_ITEM_RE = /^([A-Z]\d{4}|\d{5})\s+(.+?)\s+\$?(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)\s*$/gm

export function parseBillText(ocrText: string): LineItem[] {
  const items: LineItem[] = []
  let match: RegExpExecArray | null

  // Per RESEARCH.md Pitfall 6: global-flag regex retains lastIndex across calls.
  // Reset before each call so the parser is pure / re-entrant.
  LINE_ITEM_RE.lastIndex = 0

  while ((match = LINE_ITEM_RE.exec(ocrText)) !== null) {
    const [rawLine, cptCode, description, chargeStr] = match
    const charge = parseFloat(chargeStr.replace(/,/g, ''))
    if (!isNaN(charge)) {
      items.push({
        cptCode,
        description: description.trim(),
        charge,
        rawLine,
      })
    }
  }

  return items
}
