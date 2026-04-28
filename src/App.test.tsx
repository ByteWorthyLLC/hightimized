import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    // The Vite scaffold default App contains this heading. This test will be
    // replaced in Phase 1 with real ingest UI tests.
    expect(screen.getByText(/get started/i)).toBeInTheDocument()
  })
})
