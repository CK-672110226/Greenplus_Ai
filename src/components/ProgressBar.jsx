import PropTypes from 'prop-types'
import styles from './ProgressBar.module.css'

export function ProgressBar({ value = 0, max = 100, ticks = 0, className = '', style }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      className={`${styles.track} ${className}`}
      style={style}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className={styles.fill} style={{ width: `${pct}%` }} />
      {ticks > 0 && Array.from({ length: ticks - 1 }).map((_, i) => (
        <div
          key={i}
          className={styles.tick}
          style={{ left: `${((i + 1) / ticks) * 100}%` }}
        />
      ))}
    </div>
  )
}

ProgressBar.propTypes = {
  value:     PropTypes.number,
  max:       PropTypes.number,
  ticks:     PropTypes.number,
  className: PropTypes.string,
  style:     PropTypes.object,
}
