import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { FlagBadge } from './FlagBadge'

describe('FlagBadge', () => {
  test('renders 4.0× formatted multiplier', () => {
    render(<FlagBadge multiplier={4.0} />)
    expect(screen.getByText(/4\.0×/)).toBeInTheDocument()
  })

  test('renders 2.3× for fractional multiplier', () => {
    render(<FlagBadge multiplier={2.3} />)
    expect(screen.getByText(/2\.3×/)).toBeInTheDocument()
  })

  test('aria-label format', () => {
    render(<FlagBadge multiplier={4.0} />)
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Overcharge flag: 4.0 times hospital published rate',
    )
  })

  test('role status', () => {
    render(<FlagBadge multiplier={4.0} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
