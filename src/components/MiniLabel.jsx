export function MiniLabel({ children, style, className = '' }) {
  return (
    <span
      className={`font-data text-[9px] uppercase tracking-[0.15em] text-[var(--ink-3)] ${className}`}
      style={style}
    >
      {children}
    </span>
  )
}
