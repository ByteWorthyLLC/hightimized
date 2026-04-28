import styles from './GenerateLetterButton.module.css'

export interface GenerateLetterButtonProps {
  flaggedCount: number
  isLoading: boolean
  onGenerate: () => void
}

export function GenerateLetterButton({
  flaggedCount,
  isLoading,
  onGenerate,
}: GenerateLetterButtonProps) {
  const isDisabled = isLoading || flaggedCount === 0

  let copy: string
  if (isLoading) {
    copy = 'Building your letter…'
  } else if (flaggedCount === 0) {
    copy = 'No overcharges to dispute.'
  } else {
    copy = 'Generate dispute letter →'
  }

  const buttonClass = [
    styles.button,
    isDisabled && !isLoading ? styles.disabled : '',
    isLoading ? styles.loading : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <footer className={styles.footer}>
      <button
        className={buttonClass}
        aria-disabled={isDisabled ? 'true' : 'false'}
        aria-label={
          isDisabled
            ? 'No overcharges found to dispute'
            : 'Generate dispute letter PDF and download'
        }
        onClick={() => {
          if (!isDisabled) onGenerate()
        }}
      >
        {isLoading && <span className={styles.spinner} aria-hidden="true" />}
        {copy}
      </button>
    </footer>
  )
}
