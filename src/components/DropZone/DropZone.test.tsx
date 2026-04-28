import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { DropZone } from './DropZone'

function mockDropEvent(files: File[]) {
  return {
    dataTransfer: {
      files,
      items: files.map((f) => ({ kind: 'file', type: f.type, getAsFile: () => f })),
      types: ['Files'],
    },
  }
}

describe('DropZone', () => {
  test('calls onFileAccepted with the dropped PDF file', async () => {
    const onAccepted = vi.fn()
    const onRejected = vi.fn()
    render(<DropZone state="idle" onFileAccepted={onAccepted} onFileRejected={onRejected} />)

    const file = new File(['%PDF-1.4'], 'bill.pdf', { type: 'application/pdf' })
    await act(async () => {
      fireEvent.drop(screen.getByRole('button'), mockDropEvent([file]))
    })

    expect(onAccepted).toHaveBeenCalledWith(file)
    expect(onRejected).not.toHaveBeenCalled()
  })

  test("calls onFileRejected with 'wrong-type' for image/jpeg", async () => {
    const onAccepted = vi.fn()
    const onRejected = vi.fn()
    render(<DropZone state="idle" onFileAccepted={onAccepted} onFileRejected={onRejected} />)

    const file = new File(['data'], 'bill.jpg', { type: 'image/jpeg' })
    await act(async () => {
      fireEvent.drop(screen.getByRole('button'), mockDropEvent([file]))
    })

    expect(onRejected).toHaveBeenCalledWith('wrong-type')
    expect(onAccepted).not.toHaveBeenCalled()
  })

  test('idle state copy matches UI-SPEC', () => {
    render(<DropZone state="idle" onFileAccepted={vi.fn()} onFileRejected={vi.fn()} />)

    expect(
      screen.getByRole('heading', { level: 2, name: /Drop your hospital bill here/i }),
    ).toBeDefined()
    expect(screen.getByText("PDF only for now. We'll do the math.")).toBeDefined()
  })

  test('processing state copy', () => {
    const { rerender } = render(
      <DropZone state="idle" onFileAccepted={vi.fn()} onFileRejected={vi.fn()} />,
    )
    rerender(<DropZone state="processing" onFileAccepted={vi.fn()} onFileRejected={vi.fn()} />)

    expect(screen.getByRole('heading', { level: 2, name: /Reading your bill/i })).toBeDefined()
    expect(screen.getByText('This runs in your browser. Nothing is uploaded.')).toBeDefined()
  })

  test('complete state copy', () => {
    const { rerender } = render(
      <DropZone state="idle" onFileAccepted={vi.fn()} onFileRejected={vi.fn()} />,
    )
    rerender(<DropZone state="complete" onFileAccepted={vi.fn()} onFileRejected={vi.fn()} />)

    expect(screen.getByText('Drop another bill to start over.')).toBeDefined()
  })

  test('aria attributes', () => {
    render(<DropZone state="idle" onFileAccepted={vi.fn()} onFileRejected={vi.fn()} />)

    const zone = screen.getByRole('button')
    expect(zone).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Drop your hospital bill here'),
    )
    expect(zone).toHaveAttribute('tabindex', '0')
  })
})
