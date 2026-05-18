export function Tabs({ items = [], active, onChange, trailing, className = '' }) {
  return (
    <div
      role="tablist"
      className={`flex items-center border-b-[1.5px] border-[var(--ink)] overflow-x-auto ${className}`}
    >
      {items.map(item => {
        const isActive = item === active
        return (
          <button
            key={item}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(item)}
            className={`px-4 py-2.5 font-data text-[11px] uppercase tracking-widest shrink-0 border-none border-b-[2px] transition-colors cursor-pointer ${
              isActive
                ? 'text-[var(--green-ink)] border-b-[var(--green)] bg-[var(--green-soft)]'
                : 'text-[var(--ink-3)] border-b-transparent bg-transparent hover:text-[var(--ink)] hover:bg-[var(--paper-2)]'
            }`}
          >
            {item}
          </button>
        )
      })}
      {trailing && (
        <span className="ml-auto px-4 font-data text-[11px] text-[var(--green-ink)] shrink-0">{trailing}</span>
      )}
    </div>
  )
}
