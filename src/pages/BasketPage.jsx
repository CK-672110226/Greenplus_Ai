import { useDispatch, useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { localName, pricePerKg } from '../data/wasteItems'
import { removeFromBasket, updateWeight, toggleSkip, clearBasket } from '../store/wasteSlice'

export function BasketPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const basket   = useSelector(s => s.waste.basket)
  const language = useSelector(s => s.user.language)

  const total = basket
    .filter(i => !i.skipped)
    .reduce((sum, i) => sum + pricePerKg(i.materialType, i.grade) * (i.weight ?? 0), 0)

  const itemCount = basket.length

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <div className="w-full max-w-sm flex items-center gap-3">
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.basket}</h1>
        {itemCount > 0 && (
          <span className="inline-flex items-center justify-center w-6 h-6 bg-[var(--green)] border-[1.5px] border-[var(--ink)] font-data text-[11px] font-bold text-[#062040]">
            {itemCount}
          </span>
        )}
      </div>

      {basket.length === 0 ? (
        <Card className="w-full max-w-sm flex flex-col items-center py-10 gap-2">
          <p className="font-body text-[15px] text-[var(--ink-3)] m-0 text-center">{t.basketEmpty}</p>
        </Card>
      ) : (
        <div className="w-full max-w-sm flex flex-col gap-3">
          {basket.map(item => (
            <Card
              key={item.id}
              className={`flex flex-col gap-3 ${item.skipped ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GradeTag grade={item.grade} />
                  <span className="font-body text-[15px] text-[var(--ink)]">
                    {localName(item.materialType, language)}
                  </span>
                </div>
                <span className="font-data text-[13px] text-[var(--green)] font-bold">
                  ฿{(pricePerKg(item.materialType, item.grade) * (item.weight ?? 0)).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">kg</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.weight ?? 0}
                  onChange={e => dispatch(updateWeight({ id: item.id, weight: parseFloat(e.target.value) || 0 }))}
                  className="w-20 px-2 py-1 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-data text-[14px] outline-none focus:border-[var(--green)]"
                />
                <span className="font-data text-[11px] text-[var(--ink-3)]">
                  ฿{pricePerKg(item.materialType, item.grade).toFixed(2)}/kg
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={item.skipped ? 'primary' : 'secondary'}
                  onClick={() => dispatch(toggleSkip(item.id))}
                >
                  {item.skipped ? 'Unskip' : t.skipItem}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => dispatch(removeFromBasket(item.id))}
                >
                  {t.removeItem}
                </Button>
              </div>
            </Card>
          ))}

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-data text-[12px] text-[var(--ink-3)] uppercase tracking-widest">{t.basketTotal}</span>
              <span className="font-brand text-[22px] text-[var(--green)]">฿{total.toFixed(2)}</span>
            </div>
            <Button variant="secondary" fullWidth onClick={() => dispatch(clearBasket())}>
              {t.clearBasket}
            </Button>
          </Card>
        </div>
      )}
    </main>
  )
}
