import PropTypes from 'prop-types'

export function Skeleton({ width = '100%', height = 16, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: 4 }}
    />
  )
}

Skeleton.propTypes = {
  width:     PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height:    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
}
