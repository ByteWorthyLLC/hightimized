// scripts/build-fixtures/sample-bill.ts
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

async function generateSampleBill() {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Courier)
  const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold)

  const page = pdfDoc.addPage([612, 792])
  const { height } = page.getSize()
  const margin = 72
  let y = height - margin

  const draw = (text: string, bold = false) => {
    page.drawText(text, {
      x: margin,
      y,
      size: 11,
      font: bold ? boldFont : font,
    })
    y -= 16
  }
  const skip = () => {
    y -= 10
  }

  draw('MEMORIAL REGIONAL MEDICAL CENTER', true)
  draw('123 Hospital Drive, Springfield, ST 00000')
  draw('Patient Billing Office: (555) 000-0000')
  skip()
  draw('ITEMIZED STATEMENT', true)
  draw('Patient: [PATIENT NAME]')
  draw('Account: 000000000')
  draw('Statement Date: 2024-03-15')
  skip()
  // ASCII hyphens instead of unicode box-drawing (U+2500) — StandardFonts.Courier
  // uses WinAnsi encoding which does not include that glyph; hyphens avoid encoding errors.
  draw('-'.repeat(65))
  skip()
  draw('CODE    DESCRIPTION                              CHARGE', true)
  draw('-'.repeat(65))
  skip()

  // These three lines are exactly what the Phase 1 regex targets
  draw('99213   Office visit, est. patient, low complexity   $750.00')
  draw('85025   Complete blood count w/ diff                  $80.00')
  draw('J3490   Unclassified injection                       $200.00')
  skip()
  draw('-'.repeat(65))
  draw('TOTAL                                              $1,030.00', true)
  skip()
  draw('Please review this statement and contact billing with questions.')

  const bytes = await pdfDoc.save()
  mkdirSync('tests/fixtures', { recursive: true })
  writeFileSync(resolve('tests/fixtures/sample-bill.pdf'), Buffer.from(bytes))
  console.log('Generated tests/fixtures/sample-bill.pdf')
}

generateSampleBill().catch((err) => {
  console.error(err)
  process.exit(1)
})
