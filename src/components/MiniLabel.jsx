import { memo } from 'react'
import PropTypes from 'prop-types'
import styles from './MiniLabel.module.css'

export const MiniLabel = memo(function MiniLabel({ children, style, className = '' }) {
  return (
    <span
      className={[styles.label, className].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </span>
  )
})

MiniLabel.propTypes = {
  children:  PropTypes.node,
  style:     PropTypes.object,
  className: PropTypes.string,
}
