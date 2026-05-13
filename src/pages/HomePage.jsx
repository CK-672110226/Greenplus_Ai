import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { localName } from '../data/wasteItems'

export function HomePage() {
  const navigate  = useNavigate()
  const t         = useT()
  const { language } = useSelector(s => s.user)
  const basket    = useSelector(s => s.waste?.basket ?? [])
  const lastScan  = useSelector(s => s.waste?.lastScan)

  const activeItems = basket.filter(i => !i.skipped)
  const totalValue  = activeItems.reduce((sum, i) => sum + (i.estValue ?? 0), 0)

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* Scan CTA */}
      <Card
        className="flex flex-col items-center gap-4 py-10 cursor-pointer hover:-translate-y-px hover:shadow-[3px_3px_0_var(--ink)] transition-all text-center"
        onClick={() => navigate('/scan')}
      >
        <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
          {t.scanTap}
        </span>
        <div className="w-16 h-16 border-[2px] border-[var(--ink)] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 7 4 4 7 4" />
            <polyline points="17 4 20 4 20 7" />
            <polyline points="20 17 20 20 17 20" />
            <polyline points="7 20 4 20 4 17" />
            <rect x="8" y="8" width="8" height="8" rx="1" />
          </svg>
        </div>
        <Button variant="primary" className="w-full max-w-[200px]">
          {t.scanBtn}
        </Button>
      </Card>

      {/* Basket summary */}
      {activeItems.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
              {t.basket}
            </span>
            <button
              onClick={() => navigate('/basket')}
              className="font-data text-[11px] text-[var(--green)] uppercase tracking-widest bg-transparent border-none cursor-pointer"
            >
              {t.basketTotal} ฿{totalValue.toFixed(0)}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {activeItems.slice(0, 3).map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between border-[1.5px] border-[var(--ink-4)] px-3 py-2"
              >
                <span className="font-body text-[15px] text-[var(--ink)]">
                  {localName(item.material, language)}
                </span>
                <div className="flex items-center gap-2">
                  <GradeTag grade={item.grade} />
                  <span className="font-data text-[12px] text-[var(--ink-2)]">
                    ฿{(item.estValue ?? 0).toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
            {activeItems.length > 3 && (
              <button
                onClick={() => navigate('/basket')}
                className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest bg-transparent border-none cursor-pointer py-1 self-start"
              >
                +{activeItems.length - 3} {t.basket}
              </button>
            )}
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/basket')}
          >
            {t.findRoute}
          </Button>
        </div>
      )}

      {/* Last scan result */}
      {lastScan && (
        <Card className="flex flex-col gap-2">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
            {t.scanResult}
          </span>
          <div className="flex items-center justify-between">
            <span className="font-body text-[15px] text-[var(--ink)]">
              {localName(lastScan.material, language)}
            </span>
            <GradeTag grade={lastScan.grade} />
          </div>
          <p className="font-data text-[12px] text-[var(--ink-3)] m-0">
            {t.confidence} {lastScan.confidence}%
          </p>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/map')}
          className="flex flex-col gap-1 border-[1.5px] border-[var(--ink)] px-4 py-4 text-left bg-transparent cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors group"
        >
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest group-hover:text-[var(--paper)]">
            {t.nearbyShops}
          </span>
          <span className="font-brand text-[16px] text-[var(--ink)] group-hover:text-[var(--paper)]">
            {t.map}
          </span>
        </button>
        <button
          onClick={() => navigate('/eco-points')}
          className="flex flex-col gap-1 border-[1.5px] border-[var(--ink)] px-4 py-4 text-left bg-transparent cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors group"
        >
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest group-hover:text-[var(--paper)]">
            {t.yourPoints}
          </span>
          <span className="font-brand text-[16px] text-[var(--ink)] group-hover:text-[var(--paper)]">
            {t.ecoPoints}
          </span>
        </button>
      </div>
    </div>
  )
}
