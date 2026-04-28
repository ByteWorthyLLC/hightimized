import { useReducer, useState, useCallback } from 'react'
import { ocrFirstPageOfPdf } from './lib/ocr/ocrPdf'
import { parseBillText } from './lib/parser/parseBillText'
import type { LineItem } from './lib/parser/parseBillText'
import { getChargemasterDb, lookupChargemaster } from './data-sources/chargemasterDb'
import type { ChargemasterRow } from './data-sources/chargemasterDb'
import { flagLine } from './lib/auditor/flagLine'
import type { FlagResult } from './lib/auditor/flagLine'
import { generateDisputeLetter } from './lib/letter/generateDisputeLetter'
import { PrivacyBanner } from './components/PrivacyBanner/PrivacyBanner'
import { DropZone } from './components/DropZone/DropZone'
import type { DropZoneState } from './components/DropZone/DropZone'
import { LineItemCard } from './components/LineItemCard/LineItemCard'
import { GenerateLetterButton } from './components/GenerateLetterButton/GenerateLetterButton'
import { ToastError } from './components/ToastError/ToastError'
import styles from './App.module.css'

export interface AuditedLine extends LineItem {
  flag: FlagResult | null
  chargemasterRow: ChargemasterRow | null
}

type AuditStatus =
  | { phase: 'idle' }
  | { phase: 'ocr-loading'; progress: number }
  | { phase: 'parsing' }
  | { phase: 'audited'; lineItems: AuditedLine[]; flaggedCount: number }
  | { phase: 'letter-generating'; lineItems: AuditedLine[]; flaggedCount: number }

type AuditAction =
  | { type: 'FILE_ACCEPTED'; file: File }
  | { type: 'OCR_PROGRESS'; progress: number }
  | { type: 'OCR_COMPLETE' }
  | { type: 'AUDIT_COMPLETE'; lineItems: AuditedLine[] }
  | { type: 'OCR_ERROR'; message: string }
  | { type: 'LETTER_GENERATING' }
  | { type: 'LETTER_COMPLETE' }
  | { type: 'RESET' }

function auditReducer(state: AuditStatus, action: AuditAction): AuditStatus {
  switch (action.type) {
    case 'FILE_ACCEPTED':
      return { phase: 'ocr-loading', progress: 0 }
    case 'OCR_PROGRESS':
      return { phase: 'ocr-loading', progress: action.progress }
    case 'OCR_COMPLETE':
      return { phase: 'parsing' }
    case 'AUDIT_COMPLETE':
      return {
        phase: 'audited',
        lineItems: action.lineItems,
        flaggedCount: action.lineItems.filter((l) => l.flag).length,
      }
    case 'LETTER_GENERATING':
      if (state.phase === 'audited') {
        return {
          phase: 'letter-generating',
          lineItems: state.lineItems,
          flaggedCount: state.flaggedCount,
        }
      }
      return state
    case 'LETTER_COMPLETE':
      if (state.phase === 'letter-generating') {
        return {
          phase: 'audited',
          lineItems: state.lineItems,
          flaggedCount: state.flaggedCount,
        }
      }
      return state
    case 'OCR_ERROR':
      return { phase: 'idle' }
    case 'RESET':
      return { phase: 'idle' }
    default:
      return state
  }
}

export default function App() {
  const [status, dispatch] = useReducer(auditReducer, { phase: 'idle' })
  const [error, setError] = useState<{ title: string; body: string } | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [letterLoading, setLetterLoading] = useState(false)

  const handleFileAccepted = useCallback(async (file: File) => {
    dispatch({ type: 'FILE_ACCEPTED', file })
    try {
      const text = await ocrFirstPageOfPdf(file, (p) =>
        dispatch({ type: 'OCR_PROGRESS', progress: p }),
      )
      dispatch({ type: 'OCR_COMPLETE' })
      const lineItems = parseBillText(text)
      const db = await getChargemasterDb()
      const audited: AuditedLine[] = lineItems.map((item) => {
        const row = lookupChargemaster(db, item.cptCode)
        const flag = row ? flagLine(item.charge, row) : null
        return { ...item, flag, chargemasterRow: row }
      })
      dispatch({ type: 'AUDIT_COMPLETE', lineItems: audited })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('canvas') || message.includes('tesseract') || message.includes('OCR')) {
        setError({
          title: "Couldn't read that bill.",
          body: "The text wasn't clear enough. Try a higher-quality scan.",
        })
      } else if (message.includes('sql') || message.includes('chargemaster')) {
        setError({
          title: 'Data failed to load.',
          body: 'Reload the page to try again.',
        })
      } else {
        setError({
          title: 'Something went wrong.',
          body: 'Reload the page to try again.',
        })
      }
      dispatch({ type: 'OCR_ERROR', message })
    }
  }, [])

  const handleFileRejected = useCallback((reason: 'wrong-type' | 'too-large' | 'unknown') => {
    if (reason === 'wrong-type') {
      setError({
        title: 'File not supported.',
        body: 'Drop a PDF — image files work in a future version.',
      })
    } else if (reason === 'too-large') {
      setError({
        title: 'File too large.',
        body: 'Drop a smaller PDF (under 50MB).',
      })
    } else {
      setError({
        title: 'Could not accept that file.',
        body: 'Try again with a hospital bill PDF.',
      })
    }
  }, [])

  const handleToggleExpand = useCallback(
    (cptCode: string) => setExpanded((prev) => ({ ...prev, [cptCode]: !prev[cptCode] })),
    [],
  )

  const handleGenerate = useCallback(async () => {
    if (status.phase !== 'audited') return
    setLetterLoading(true)
    try {
      const flagged = status.lineItems
        .filter((l) => l.flag)
        .map((l) => ({
          cptCode: l.cptCode,
          description: l.description,
          charged: l.flag!.charged,
          publishedRate: l.flag!.comparisonRate,
          multiplier: l.flag!.multiplier,
        }))
      const bytes = await generateDisputeLetter(flagged)
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hightimized-dispute-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 30000)
    } catch {
      setError({
        title: "Letter didn't generate.",
        body: 'Reload the page and try again. Your bill data is still here.',
      })
    } finally {
      setLetterLoading(false)
    }
  }, [status])

  const dropZoneState: DropZoneState = (() => {
    if (status.phase === 'ocr-loading' || status.phase === 'parsing') return 'processing'
    if (status.phase === 'audited' || status.phase === 'letter-generating') return 'complete'
    return 'idle'
  })()

  const lineItems =
    status.phase === 'audited' || status.phase === 'letter-generating' ? status.lineItems : null

  return (
    <>
      <PrivacyBanner />
      <main className={styles.content}>
        <section className={styles.heroZone}>
          <DropZone
            state={dropZoneState}
            onFileAccepted={handleFileAccepted}
            onFileRejected={handleFileRejected}
          />
        </section>
        {lineItems && lineItems.length > 0 ? (
          <section className={styles.list} aria-live="polite">
            {lineItems.map((line) => (
              <LineItemCard
                key={line.cptCode}
                cptCode={line.cptCode}
                description={line.description}
                charge={line.charge}
                flag={line.flag}
                isExpanded={!!expanded[line.cptCode]}
                onToggleExpand={() => handleToggleExpand(line.cptCode)}
              />
            ))}
          </section>
        ) : null}
      </main>
      {lineItems && lineItems.length > 0 ? (
        <GenerateLetterButton
          flaggedCount={lineItems.filter((l) => l.flag).length}
          isLoading={letterLoading}
          onGenerate={handleGenerate}
        />
      ) : null}
      {error ? (
        <ToastError title={error.title} body={error.body} onDismiss={() => setError(null)} />
      ) : null}
    </>
  )
}
