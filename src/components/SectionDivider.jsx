import PropTypes from 'prop-types'
import styles from './SectionDivider.module.css'

export function SectionDivider({ label }) {
  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.line} />
    </div>
  )
}

SectionDivider.propTypes = {
  label: PropTypes.string,
}
