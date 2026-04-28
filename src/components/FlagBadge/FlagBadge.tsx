import styles from './FlagBadge.module.css'

export interface FlagBadgeProps {
  multiplier: number
}

export function FlagBadge({ multiplier }: FlagBadgeProps) {
  const formatted = multiplier.toFixed(1)
  return (
    <span
      className={styles.badge}
      role="status"
      aria-label={`Overcharge flag: ${formatted} times hospital published rate`}
    >
      {`${formatted}× hospital published rate`}
    </span>
  )
}
