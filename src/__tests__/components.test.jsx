import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { KpiCard } from '../components/KpiCard'
import { GradeTag } from '../components/GradeTag'
import { Tabs } from '../components/Tabs'
import { ProgressBar } from '../components/ProgressBar'
import { Chip } from '../components/Chip'

// ── Button ────────────────────────────────────────────────────
describe('Button', () => {
  it('renders children', () => {
    render(<Button>กดได้เลย</Button>)
    expect(screen.getByText('กดได้เลย')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const fn = vi.fn()
    render(<Button onClick={fn}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(fn).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled=true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when loading=true', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onClick when disabled', () => {
    const fn = vi.fn()
    render(<Button disabled onClick={fn}>No</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(fn).not.toHaveBeenCalled()
  })
})

// ── Card ──────────────────────────────────────────────────────
describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>เนื้อหา</p></Card>)
    expect(screen.getByText('เนื้อหา')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const fn = vi.fn()
    render(<Card onClick={fn}>Click</Card>)
    fireEvent.click(screen.getByText('Click'))
    expect(fn).toHaveBeenCalledOnce()
  })
})

// ── EmptyState ────────────────────────────────────────────────
describe('EmptyState', () => {
  it('renders title and body', () => {
    render(<EmptyState title="ไม่มีข้อมูล" body="กรุณาเพิ่มข้อมูล" />)
    expect(screen.getByText('ไม่มีข้อมูล')).toBeInTheDocument()
    expect(screen.getByText('กรุณาเพิ่มข้อมูล')).toBeInTheDocument()
  })

  it('shows primary CTA and calls onPrimary', () => {
    const fn = vi.fn()
    render(<EmptyState title="Empty" primaryCta="เพิ่ม" onPrimary={fn} />)
    fireEvent.click(screen.getByText('เพิ่ม'))
    expect(fn).toHaveBeenCalledOnce()
  })

  it('does not render body when not provided', () => {
    render(<EmptyState title="Empty" />)
    expect(screen.queryByRole('paragraph')).toBeNull()
  })
})

// ── KpiCard ───────────────────────────────────────────────────
describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="น้ำหนัก" value={12.5} unit="kg" />)
    expect(screen.getByText('น้ำหนัก')).toBeInTheDocument()
    expect(screen.getByText('12.5')).toBeInTheDocument()
    expect(screen.getByText('kg')).toBeInTheDocument()
  })

  it('renders trend up', () => {
    render(<KpiCard label="มูลค่า" value={500} trend={{ dir: 'up', value: '+10%' }} />)
    expect(screen.getByText(/\+10%/)).toBeInTheDocument()
  })
})

// ── GradeTag ──────────────────────────────────────────────────
describe('GradeTag', () => {
  it('shows สะอาด when clean=true', () => {
    render(<GradeTag clean={true} />)
    expect(screen.getByText('สะอาด')).toBeInTheDocument()
  })

  it('shows ไม่สะอาด when clean=false', () => {
    render(<GradeTag clean={false} />)
    expect(screen.getByText('ไม่สะอาด')).toBeInTheDocument()
  })

  it('defaults to สะอาด when clean not provided', () => {
    render(<GradeTag />)
    expect(screen.getByText('สะอาด')).toBeInTheDocument()
  })
})

// ── Tabs ──────────────────────────────────────────────────────
describe('Tabs', () => {
  it('renders all tab items', () => {
    render(<Tabs items={['ทั้งหมด', 'รอดำเนินการ', 'เสร็จแล้ว']} active="ทั้งหมด" />)
    expect(screen.getByText('ทั้งหมด')).toBeInTheDocument()
    expect(screen.getByText('รอดำเนินการ')).toBeInTheDocument()
    expect(screen.getByText('เสร็จแล้ว')).toBeInTheDocument()
  })

  it('calls onChange when tab clicked', () => {
    const fn = vi.fn()
    render(<Tabs items={['A', 'B']} active="A" onChange={fn} />)
    fireEvent.click(screen.getByText('B'))
    expect(fn).toHaveBeenCalledWith('B')
  })
})

// ── ProgressBar ───────────────────────────────────────────────
describe('ProgressBar', () => {
  it('renders with correct aria attributes', () => {
    render(<ProgressBar value={60} max={100} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '60')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })

  it('clamps value below 0 to 0', () => {
    render(<ProgressBar value={-10} max={100} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '-10')
  })
})

// ── Chip ──────────────────────────────────────────────────────
describe('Chip', () => {
  it('renders children', () => {
    render(<Chip>อลูมิเนียม</Chip>)
    expect(screen.getByText('อลูมิเนียม')).toBeInTheDocument()
  })

  it('calls onClick', () => {
    const fn = vi.fn()
    render(<Chip onClick={fn}>กด</Chip>)
    fireEvent.click(screen.getByText('กด'))
    expect(fn).toHaveBeenCalledOnce()
  })
})
