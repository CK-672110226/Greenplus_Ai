export function Avatar({ name = '', size = 32, style }) {
  const initial = (name || '?')[0].toUpperCase()
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 border-[1.5px] border-[var(--ink)] bg-[var(--green-soft)] text-[var(--green-ink)] font-brand"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.45), borderRadius: '50%', ...style }}
      aria-label={name}
    >
      {initial}
    </span>
  )
}
