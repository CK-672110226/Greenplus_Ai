import { useSelector } from 'react-redux'

export function Logo({ height = 28, className = '' }) {
  const darkMode = useSelector(s => s.user.darkMode)
  return (
    <img
      src={darkMode ? '/Darkmode.png' : '/Lightmode.png'}
      alt="GreenPlus.Ai"
      height={height}
      style={{ height, width: 'auto', display: 'block' }}
      draggable={false}
      className={className}
    />
  )
}
