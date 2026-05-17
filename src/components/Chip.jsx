export function Chip({ children, variant = 'default', style, onClick }) {
  const base = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 font-data text-[11px] uppercase tracking-widest border-[1.5px] transition-colors'
  const variants = {
    default: 'border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)]',
    soft:    'border-[var(--ink-4)] bg-[var(--paper-2)] text-[var(--ink-2)]',
    green:   'border-[var(--green-ink)] bg-[var(--green-soft)] text-[var(--green-ink)]',
    orange:  'border-[var(--orange)] bg-transparent text-[var(--orange)]',
  }
  return (
    <span
      className={`${base} ${variants[variant] ?? variants.default} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </span>
  )
}
