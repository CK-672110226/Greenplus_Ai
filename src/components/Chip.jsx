import { memo } from 'react'
import PropTypes from 'prop-types'
import styles from './Chip.module.css'

export const Chip = memo(function Chip({ children, variant = 'default', style, onClick }) {
  return (
    <span
      className={[
        styles.chip,
        styles[variant] ?? styles.default,
        onClick ? styles.clickable : '',
      ].filter(Boolean).join(' ')}
      style={style}
      onClick={onClick}
    >
      {children}
    </span>
  )
})

Chip.propTypes = {
  children: PropTypes.node,
  variant:  PropTypes.oneOf(['default', 'soft', 'green', 'orange']),
  style:    PropTypes.object,
  onClick:  PropTypes.func,
}
