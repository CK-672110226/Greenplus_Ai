import { useSelector } from 'react-redux'

export function LogoWordmark({ fontSize = 22, inverse = false }) {
  const ink   = inverse ? '#fafaf7' : 'var(--ink)'
  const green = inverse ? '#22c55e' : 'var(--green-ink)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'baseline', lineHeight: 1,
      fontFamily: 'var(--font-brand)', fontSize, letterSpacing: '-0.01em',
    }}>
      <span style={{ color: ink }}>Green</span>
      <span style={{ color: green }}>Plus</span>
      <sup style={{
        fontFamily: 'var(--font-data)',
        fontSize: Math.round(fontSize * 0.26),
        marginLeft: 4,
        color: ink,
        opacity: 0.65,
        fontWeight: 500,
        letterSpacing: '.1em',
        alignSelf: 'center',
      }}>Ai</sup>
    </span>
  )
}

export function Logo({ height = 28, showWordmark = true, className = '' }) {
  const darkMode = useSelector(s => s.user.darkMode)
  const gap      = Math.max(6, Math.round(height * 0.28))
  const fontSize = Math.max(11, Math.round(height * 0.6))

  return (
    <span
      className={`inline-flex items-center ${className}`}
      style={{ gap }}
      aria-label="GreenPlus.Ai"
    >
      <img
        src={darkMode ? '/Darkmode.png' : '/Lightmode.png'}
        alt=""
        height={height}
        style={{ height, width: 'auto', display: 'block', flexShrink: 0 }}
        draggable={false}
      />
      {showWordmark && <LogoWordmark fontSize={fontSize} inverse={darkMode} />}
    </span>
  )
}
