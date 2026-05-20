import PropTypes from 'prop-types'
import { Button } from './Button'

export function EmptyState({ icon = '◯', title, body, primaryCta, onPrimary, secondaryCta, onSecondary }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 px-5 text-center">
      <div
        className="w-[84px] h-[84px] border-[2px] border-dashed border-[var(--ink-4)] bg-[var(--paper-2)] grid place-items-center font-brand text-[38px] text-[var(--ink-3)]"
        style={{ borderRadius: 18 }}
      >
        {icon}
      </div>
      <div className="font-brand text-[24px] text-[var(--ink)] leading-tight">{title}</div>
      {body && <p className="font-body text-[16px] text-[var(--ink-2)] max-w-[280px] leading-snug m-0">{body}</p>}
      <div className="flex gap-3 mt-2 flex-wrap justify-center">
        {primaryCta && <Button variant="primary" onClick={onPrimary}>{primaryCta}</Button>}
        {secondaryCta && <Button variant="ghost" onClick={onSecondary}>{secondaryCta}</Button>}
      </div>
    </div>
  )
}

EmptyState.propTypes = {
  icon:         PropTypes.node,
  title:        PropTypes.string.isRequired,
  body:         PropTypes.string,
  primaryCta:   PropTypes.string,
  onPrimary:    PropTypes.func,
  secondaryCta: PropTypes.string,
  onSecondary:  PropTypes.func,
}
