import type { KeyboardEvent } from 'react'
import type { FlagResult } from '../../lib/auditor/flagLine'
import { FlagBadge } from '../FlagBadge/FlagBadge'
import { TraceDetail } from '../TraceDetail/TraceDetail'
import styles from './LineItemCard.module.css'

export interface LineItemCardProps {
  cptCode: string
  description: string
  charge: number
  flag: FlagResult | null
  isExpanded: boolean
  onToggleExpand: () => void
}

export function LineItemCard({
  cptCode,
  description,
  charge,
  flag,
  isExpanded,
  onToggleExpand,
}: LineItemCardProps) {
  if (flag === null) {
    return (
      <article className={styles.card}>
        <div className={styles.row}>
          <span className={styles.code}>{cptCode}</span>
          <span className={styles.description}>{description}</span>
          <span className={styles.amount}>${charge.toFixed(2)}</span>
        </div>
      </article>
    )
  }

  function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === 'Enter') {
      onToggleExpand()
    } else if (e.key === ' ') {
      e.preventDefault()
      onToggleExpand()
    }
  }

  return (
    <article
      className={`${styles.card} ${styles.flagged}`}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-controls={`trace-${cptCode}`}
      onClick={onToggleExpand}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.row}>
        <span className={styles.code}>{cptCode}</span>
        <span className={styles.description}>{description}</span>
        <FlagBadge multiplier={flag.multiplier} />
        <span className={styles.amount}>${charge.toFixed(2)}</span>
        <span
          className={`${styles.caret} ${isExpanded ? styles.caretExpanded : ''}`}
          aria-hidden="true"
        />
      </div>
      <TraceDetail cptCode={cptCode} flag={flag} isExpanded={isExpanded} />
    </article>
  )
}
