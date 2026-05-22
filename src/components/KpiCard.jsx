import { memo } from 'react'
import PropTypes from 'prop-types'
import styles from './KpiCard.module.css'

export const KpiCard = memo(function KpiCard({ label, value, unit, trend, sub }) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {unit && <small className={styles.unit}>{unit}</small>}
      </div>
      {trend && (
        <span className={trend.dir === 'down' ? styles.trendDown : styles.trendUp}>
          {trend.dir === 'down' ? '▼' : '▲'} {trend.value}
          {trend.note && <span className={styles.trendNote}>{trend.note}</span>}
        </span>
      )}
      {sub && <span className={styles.sub}>{sub}</span>}
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
