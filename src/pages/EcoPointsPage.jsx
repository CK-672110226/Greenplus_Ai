import { useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { useScanHistory } from '../hooks/useScanHistory'
import { Card } from '../components/Card'
import { localName } from '../data/wasteItems'

export function EcoPointsPage() {
  const t        = useT()
  const profile  = useSelector(s => s.user.profile)
  const language = useSelector(s => s.user.language)
  const { scans, loading } = useScanHistory()

  const balance = profile?.eco_points ?? 0

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0 self-start max-w-sm w-full">
        {t.ecoPointsTitle}
      </h1>

      {/* Balance card */}
      <Card className="w-full max-w-sm flex flex-col items-center gap-1 py-10">
        <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">
          {t.yourPoints}
        </span>
        <span className="font-brand text-[80px] text-[var(--green)] leading-none">{balance}</span>
        <span className="font-data text-[13px] text-[var(--ink-3)]">pts</span>
        <p className="font-body text-[13px] text-[var(--ink-3)] text-center mt-3 max-w-[200px] m-0">
          {t.pointsExplain}
        </p>
      </Card>

      {/* Points legend */}
      <div className="w-full max-w-sm flex items-center gap-3 border-[1.5px] border-[var(--ink-4)] px-4 py-3">
        <span className="font-brand text-[20px] text-[var(--green)] leading-none">10</span>
        <div className="flex flex-col">
          <span className="font-data text-[11px] text-[var(--ink)] uppercase tracking-widest">pts / kg</span>
          <span className="font-data text-[10px] text-[var(--ink-4)]">minimum 1 pt per scan</span>
        </div>
      </div>

      {/* Scan history with points */}
      <div className="w-full max-w-sm flex flex-col gap-2">
        <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">
          {t.pointsHistory}
        </span>

        {loading && (
          <>
            <div className="h-10 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
            <div className="h-10 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
            <div className="h-10 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
          </>
        )}

        {!loading && scans.length === 0 && (
          <div className="border-[1.5px] border-[var(--ink-4)] px-4 py-4">
            <p className="font-data text-[11px] text-[var(--ink-3)] m-0 uppercase tracking-widest">
              {t.earnedFrom} scanning recyclables
            </p>
          </div>
        )}

        {!loading && scans.map(item => {
          const pts  = Math.max(1, Math.round((item.weight_kg ?? 0) * 10))
          const date = item.scanned_at ? new Date(item.scanned_at).toLocaleDateString() : '—'
          return (
            <div
              key={item.id}
              className="flex items-center justify-between border-[1.5px] border-[var(--ink-4)] px-3 py-2 gap-2"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-body text-[13px] text-[var(--ink)] truncate">
                  {localName(item.material_type, language)}
                </span>
                <span className="font-data text-[10px] text-[var(--ink-4)]">{date}</span>
              </div>
              <span className="font-data text-[13px] text-[var(--green)] shrink-0">+{pts} pts</span>
            </div>
          )
        })}
      </div>
    </main>
  )
}
