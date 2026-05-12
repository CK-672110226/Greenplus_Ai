import { useT } from '../hooks/useT'
import { Card } from '../components/Card'

export function MapPage() {
  const t = useT()
  return (
    <main className="flex flex-col items-center px-6 py-16 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.map}</h1>
      <Card className="w-full max-w-sm aspect-square flex flex-col items-center justify-center gap-2">
        <span className="font-data text-[11px] text-[var(--ink-4)] uppercase tracking-widest">M5 — Smart Map</span>
        <p className="font-body text-[15px] text-[var(--ink-3)] m-0 text-center">{t.comingSoon}</p>
      </Card>
    </main>
  )
}
