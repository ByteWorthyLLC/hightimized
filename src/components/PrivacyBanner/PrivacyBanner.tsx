import styles from './PrivacyBanner.module.css'

export function PrivacyBanner() {
  return (
    <div role="banner" className={styles.banner}>
      Your data never leaves your device. No upload, no account.
    </div>
  )
}
