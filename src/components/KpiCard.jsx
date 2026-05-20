import { memo } from 'react'
import PropTypes from 'prop-types'

export const KpiCard = memo(function KpiCard({ label, value, unit, trend, sub }) {
  return (
    <div className="flex flex-col gap-1 p-4 bg-[var(--paper-2)] border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">
      <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{label}</span>
      <div className="font-brand text-[32px] text-[var(--ink)] leading-none">
        {value}{unit && <small className="font-data text-[14px] ml-1">{unit}</small>}
      </div>
      {trend && (
        <span className={`font-data text-[11px] ${trend.dir === 'down' ? 'text-[var(--orange)]' : 'text-[var(--green-ink)]'}`}>
          {trend.dir === 'down' ? '▼' : '▲'} {trend.value}
          {trend.note && <span className="text-[var(--ink-3)] ml-1">{trend.note}</span>}
        </span>
      )}
      {sub && <span className="font-data text-[11px] text-[var(--ink-3)]">{sub}</span>}
    </div>
  )
})

KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit:  PropTypes.string,
  trend: PropTypes.shape({
    dir:   PropTypes.oneOf(['up', 'down']).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    note:  PropTypes.string,
  }),
  sub: PropTypes.string,
}
