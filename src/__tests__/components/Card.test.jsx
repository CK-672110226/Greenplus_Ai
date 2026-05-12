import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card } from '../../components/Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello</Card>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('merges extra className', () => {
    render(<Card className="my-custom-class">Content</Card>)
    expect(screen.getByText('Content').className).toContain('my-custom-class')
  })

  it('calls onClick when clicked', async () => {
    const handler = vi.fn()
    render(<Card onClick={handler}>Card</Card>)
    await userEvent.click(screen.getByText('Card'))
    expect(handler).toHaveBeenCalledOnce()
  })
})
