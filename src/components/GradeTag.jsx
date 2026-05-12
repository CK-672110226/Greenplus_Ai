const GRADE_STYLES = {
  A: { background: '#22C55E', color: '#062040' },
  B: { background: '#FFF3A8', color: '#5A4A1A' },
  C: { background: '#FFFFFF', color: '#7A7A7A' },
}

export function GradeTag({ grade }) {
  const style = GRADE_STYLES[grade] ?? GRADE_STYLES.C
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 font-data text-[11px] font-bold border-[1.5px] border-[var(--ink)]"
      style={style}
    >
      {grade}
    </span>
  )
}
