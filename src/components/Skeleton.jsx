export function Skeleton({ width = '100%', height = 16, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: 4 }}
    />
  )
}
