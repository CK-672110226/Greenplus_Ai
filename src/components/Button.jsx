export function Button({ children, variant = 'primary', onClick, type = 'button', fullWidth = false, disabled = false }) {
  const base = [
    'inline-flex items-center justify-center px-5 py-2.5',
    'font-body text-[17px]',
    'border-[1.5px] border-[var(--ink)]',
    'shadow-[2px_2px_0_var(--ink)]',
    'transition-all duration-75',
    'active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    fullWidth ? 'w-full' : '',
  ].join(' ')

  const variants = {
    primary:   'bg-[var(--green)] text-[#062040]',
    secondary: 'bg-[var(--paper)] text-[var(--ink)]',
    ghost:     'bg-transparent text-[var(--ink)] border-transparent shadow-none',
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  )
}
