import { memo } from 'react'
import PropTypes from 'prop-types'
import styles from './Button.module.css'

export const Button = memo(function Button({
  children, variant = 'primary', onClick, type = 'button',
  fullWidth = false, disabled = false, loading = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        styles.btn,
        styles[variant],
        fullWidth ? styles.fullWidth : '',
      ].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  )
})

Button.propTypes = {
  children:  PropTypes.node.isRequired,
  variant:   PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  onClick:   PropTypes.func,
  type:      PropTypes.oneOf(['button', 'submit', 'reset']),
  fullWidth: PropTypes.bool,
  disabled:  PropTypes.bool,
  loading:   PropTypes.bool,
}
