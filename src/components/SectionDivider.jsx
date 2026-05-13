export function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-1">
      {label && (
        <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest whitespace-nowrap">
          {label}
        </span>
      )}
      <div className="flex-1 h-px bg-[var(--ink-4)]" />
    </div>
  )
}
