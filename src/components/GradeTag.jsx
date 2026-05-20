import { memo } from 'react'
import PropTypes from 'prop-types'

export const GradeTag = memo(function GradeTag({ clean }) {
  const ok = clean !== false
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 font-data text-[11px] font-bold border-[1.5px] border-[var(--ink)]"
      style={{ background: ok ? 'var(--green)' : 'var(--orange)', color: ok ? '#062040' : 'var(--ink)' }}
    >
      {ok ? 'สะอาด' : 'ไม่สะอาด'}
    </span>
  )
})

GradeTag.propTypes = {
  clean: PropTypes.bool,
}
