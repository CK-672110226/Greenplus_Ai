import { memo } from 'react'
import PropTypes from 'prop-types'
import styles from './Card.module.css'

export const Card = memo(function Card({ children, className = '', onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={[
        styles.card,
        onClick ? styles.clickable : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
})

Card.propTypes = {
  children:  PropTypes.node,
  className: PropTypes.string,
  onClick:   PropTypes.func,
  style:     PropTypes.object,
}
