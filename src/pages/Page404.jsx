import { useNavigate } from 'react-router-dom'

export function Page404() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="font-brand text-[120px] leading-none text-[var(--ink-4)] select-none">404</div>
      <div className="border-t-[2px] border-[var(--ink)] w-16" />
      <h1 className="font-brand text-[32px] text-[var(--ink)]">Page not found</h1>
      <p className="font-body text-[16px] text-[var(--ink-2)] max-w-[320px] leading-snug">
        This page doesn&apos;t exist or you don&apos;t have permission to view it.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 border-[1.5px] border-[var(--ink)] font-data text-[12px] uppercase tracking-widest bg-transparent cursor-pointer hover:bg-[var(--paper-2)] transition-colors"
        >
          &larr; Go back
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 border-[1.5px] border-[var(--ink)] font-data text-[12px] uppercase tracking-widest bg-[var(--ink)] text-[var(--paper)] cursor-pointer hover:opacity-90 transition-opacity"
        >
          Home
        </button>
      </div>
      <div className="font-data text-[10px] text-[var(--ink-4)] mt-4">GreenPlus Ai &middot; v0.6</div>
    </div>
  )
}
