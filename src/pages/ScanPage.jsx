import { useT } from '../hooks/useT'
import { Card } from '../components/Card'

export function ScanPage() {
  const t = useT()
  return (
    <main className="flex flex-col items-center px-6 py-16 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.scan}</h1>
      <Card className="w-full max-w-sm flex flex-col items-center gap-4 py-10">
        <div className="w-full aspect-video border-[1.5px] border-dashed border-[var(--ink-4)] flex items-center justify-center bg-[var(--paper)]">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">M3 — AI Scanner</span>
        </div>
        <p className="font-body text-[15px] text-[var(--ink-3)] m-0 text-center">{t.comingSoon}</p>
      </Card>
    </main>
  )
}
