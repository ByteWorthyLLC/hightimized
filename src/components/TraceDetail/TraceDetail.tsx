import type { FlagResult } from '../../lib/auditor/flagLine'
import styles from './TraceDetail.module.css'

export interface TraceDetailProps {
  cptCode: string
  flag: FlagResult
  isExpanded: boolean
}

export function TraceDetail({ cptCode, flag, isExpanded }: TraceDetailProps) {
  return (
    <div
      id={`trace-${cptCode}`}
      className={styles.trace}
      role="region"
      aria-label={`Rule trace for CPT ${cptCode}`}
      hidden={!isExpanded}
    >
      <div className={styles.row}>{`Rule: charge > 1.5× hospital published rate (matched).`}</div>
      <div className={styles.row}>{`Charged: $${flag.charged.toFixed(2)}`}</div>
      <div className={styles.row}>
        {`Hospital published rate: $${flag.comparisonRate.toFixed(2)}`}
      </div>
      <div className={styles.row}>{`Multiplier: ${flag.multiplier.toFixed(1)}×`}</div>
      <p className={styles.plain}>
        We found you were charged <strong>{flag.plainEnglishMultiplier}</strong> times what this
        hospital publicly says they charge for this code.
      </p>
    </div>
  )
}
