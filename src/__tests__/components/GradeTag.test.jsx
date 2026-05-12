import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GradeTag } from '../../components/GradeTag'

describe('GradeTag', () => {
  it('renders grade A with green background', () => {
    render(<GradeTag grade="A" />)
    const tag = screen.getByText('A')
    expect(tag).toBeInTheDocument()
    expect(tag).toHaveStyle({ background: '#22C55E' })
  })

  it('renders grade B with yellow background', () => {
    render(<GradeTag grade="B" />)
    const tag = screen.getByText('B')
    expect(tag).toHaveStyle({ background: '#FFF3A8' })
  })

  it('renders grade C with white background', () => {
    render(<GradeTag grade="C" />)
    const tag = screen.getByText('C')
    expect(tag).toHaveStyle({ background: '#FFFFFF' })
  })

  it('falls back to grade C style for unknown grade', () => {
    render(<GradeTag grade="X" />)
    const tag = screen.getByText('X')
    expect(tag).toHaveStyle({ background: '#FFFFFF' })
  })
})
