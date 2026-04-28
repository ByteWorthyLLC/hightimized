import { useEffect } from 'react'
import styles from './ToastError.module.css'

export interface ToastErrorProps {
  title: string
  body: string
  onDismiss: () => void
}

export function ToastError({ title, body, onDismiss }: ToastErrorProps) {
  useEffect(() => {
    const timerId = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timerId)
  }, [onDismiss])

  return (
    <div role="alert" aria-live="assertive" aria-atomic="true" className={styles.toast}>
      <div className={styles.title}>{title}</div>
      <div className={styles.body}>{body}</div>
      <button type="button" className={styles.close} aria-label="Dismiss error" onClick={onDismiss}>
        ×
      </button>
    </div>
  )
}
