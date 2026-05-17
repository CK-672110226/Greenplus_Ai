export function Card({ children, className = '', onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`bg-[var(--paper-2)] border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] p-5 hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px transition-all duration-150${onClick ? ' cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
