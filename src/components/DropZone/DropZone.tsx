import { useDropzone, type FileRejection } from 'react-dropzone'
import styles from './DropZone.module.css'

export type DropZoneState = 'idle' | 'dragging' | 'processing' | 'complete'

export interface DropZoneProps {
  onFileAccepted: (file: File) => void
  onFileRejected: (reason: 'wrong-type' | 'too-large' | 'unknown') => void
  state: DropZoneState
}

function mapRejectionCode(rejections: FileRejection[]): 'wrong-type' | 'too-large' | 'unknown' {
  const code = rejections[0]?.errors[0]?.code
  if (code === 'file-invalid-type') return 'wrong-type'
  if (code === 'file-too-large') return 'too-large'
  return 'unknown'
}

export function DropZone({ onFileAccepted, onFileRejected, state }: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: 50 * 1024 * 1024,
    onDropAccepted: (files) => onFileAccepted(files[0]),
    onDropRejected: (rejections) => onFileRejected(mapRejectionCode(rejections)),
    disabled: state === 'processing' || state === 'complete',
    noClick: state === 'complete',
  })

  const isDragging = isDragActive && state === 'idle'

  const zoneClass = [
    styles.zone,
    isDragging ? styles.dragging : '',
    state === 'complete' ? styles.complete : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      {...getRootProps()}
      role="button"
      aria-label="Drop your hospital bill here, or press Enter to browse"
      aria-describedby="dropzone-subtitle"
      tabIndex={0}
      className={zoneClass}
    >
      <input {...getInputProps()} aria-hidden="true" />

      {state === 'idle' && !isDragging && (
        <>
          <h2 className={styles.heading}>Drop your hospital bill here.</h2>
          <p id="dropzone-subtitle" className={styles.subtitle}>
            PDF only for now. We&apos;ll do the math.
          </p>
        </>
      )}

      {isDragging && <h2 className={styles.heading}>Drop it.</h2>}

      {state === 'processing' && (
        <>
          <div className={styles.spinner} aria-hidden="true" />
          <h2 className={styles.heading}>Reading your bill&hellip;</h2>
          <p className={styles.subtitle}>This runs in your browser. Nothing is uploaded.</p>
        </>
      )}

      {state === 'complete' && <p className={styles.subtitle}>Drop another bill to start over.</p>}
    </div>
  )
}
