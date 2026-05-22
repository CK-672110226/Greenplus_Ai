import { memo } from 'react'
import PropTypes from 'prop-types'
import styles from './Avatar.module.css'

export const Avatar = memo(function Avatar({ name = '', size = 32, style }) {
  const initial = (name || '?')[0].toUpperCase()
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.45), ...style }}
      aria-label={name}
    >
      {initial}
    </span>
  )
})

Avatar.propTypes = {
  name:  PropTypes.string,
  size:  PropTypes.number,
  style: PropTypes.object,
}
