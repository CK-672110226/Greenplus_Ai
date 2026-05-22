import PropTypes from 'prop-types'
import styles from './Skeleton.module.css'

export function Skeleton({ width = '100%', height = 16, className = '' }) {
  return (
    <div
      className={[styles.skeleton, className].filter(Boolean).join(' ')}
      style={{ width, height }}
    />
  )
}

Skeleton.propTypes = {
  width:     PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height:    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
}
