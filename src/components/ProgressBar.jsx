export function ProgressBar({ value = 0, max = 100, ticks = 0, className = '', style }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      className={`relative h-2.5 bg-[var(--paper-2)] border-[1.5px] border-[var(--ink)] overflow-hidden ${className}`}
      style={style}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="absolute inset-y-0 left-0 bg-[var(--green)] transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
      {ticks > 0 && Array.from({ length: ticks - 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px bg-[var(--ink)] opacity-30"
          style={{ left: `${((i + 1) / ticks) * 100}%` }}
        />
      ))}
    </div>
  )
}
