import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { GenerateLetterButton } from './GenerateLetterButton'

describe('GenerateLetterButton', () => {
  test('disabled when flaggedCount=0', () => {
    render(<GenerateLetterButton flaggedCount={0} isLoading={false} onGenerate={vi.fn()} />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-disabled', 'true')
    expect(btn).toHaveTextContent('No overcharges to dispute.')
  })

  test('active when flaggedCount >= 1', () => {
    render(<GenerateLetterButton flaggedCount={1} isLoading={false} onGenerate={vi.fn()} />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-disabled', 'false')
    expect(btn).toHaveTextContent(/Generate dispute letter/)
  })

  test('loading state shows correct copy and aria-disabled', () => {
    render(<GenerateLetterButton flaggedCount={1} isLoading={true} onGenerate={vi.fn()} />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveTextContent('Building your letter…')
    expect(btn).toHaveAttribute('aria-disabled', 'true')
  })

  test('calls onGenerate when active button is clicked', async () => {
    const onGenerate = vi.fn()
    render(<GenerateLetterButton flaggedCount={1} isLoading={false} onGenerate={onGenerate} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onGenerate).toHaveBeenCalledTimes(1)
  })

  test('does NOT call onGenerate when disabled (flaggedCount=0)', async () => {
    const onGenerate = vi.fn()
    render(<GenerateLetterButton flaggedCount={0} isLoading={false} onGenerate={onGenerate} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onGenerate).not.toHaveBeenCalled()
  })
})
