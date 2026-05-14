/* =========================================================
   ATOMS — shared primitives.
   Edit here once → propagates everywhere.

   Exports on window:
     Button, Card, Chip, GradeTag, MiniLabel, Avatar,
     KpiCard, ProgressBar, Tabs, PlaceholderBox,
     FieldRow, SectionDivider, Crumbs, PageHead
   ========================================================= */

function Button({ variant = 'primary', fullWidth, disabled, children, style, ...rest }) {
  const cls = 'btn ' + (variant === 'primary' ? 'primary' : variant === 'ghost' ? 'ghost' : '');
  return (
    <button
      {...rest}
      disabled={disabled}
      className={cls + (rest.className ? ' ' + rest.className : '')}
      style={{
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}>
      {children}
    </button>
  );
}

function Card({ children, onClick, className = '', style }) {
  return (
    <div onClick={onClick}
         className={'card ' + className}
         style={{ cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  );
}

function Chip({ children, variant = 'default', style }) {
  const cls = 'chip' + (variant === 'soft' ? ' soft' : variant === 'green' ? ' green' : '');
  return <span className={cls} style={style}>{children}</span>;
}

function GradeTag({ grade = 'A' }) {
  const map = {
    A: { bg: 'var(--green)', fg: '#062040' },
    B: { bg: '#FFF3A8', fg: '#5A4A1A' },
    C: { bg: 'var(--paper)', fg: 'var(--ink-3)' },
  };
  const c = map[grade] || map.A;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 22, height: 22, padding: '0 6px',
      borderRadius: 6,
      border: '1.5px solid var(--line)',
      background: c.bg, color: c.fg,
      fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
    }}>{grade}</span>
  );
}

function MiniLabel({ children, style }) {
  return <span className="mini-label" style={style}>{children}</span>;
}

function Avatar({ initial = 'A', size = 32, style }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      border: '1.5px solid var(--line)',
      background: 'var(--paper-2)', color: 'var(--ink-2)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--hand)', fontSize: Math.round(size * 0.5),
      flex: '0 0 auto',
      ...style,
    }}>{initial}</span>
  );
}

function KpiCard({ label, value, unit, trend, sub, style }) {
  return (
    <Card style={style}>
      <MiniLabel>{label}</MiniLabel>
      <div className="kpi">{value}{unit && <small>{unit}</small>}</div>
      {trend && (
        <div className="row mono" style={{ color: trend.dir === 'down' ? '#b94a3a' : 'var(--green-ink)', gap: 6 }}>
          <span>{trend.dir === 'down' ? '▼' : '▲'} {trend.value}</span>
          {trend.note && <span className="mut" style={{ color: 'var(--ink-3)' }}>{trend.note}</span>}
        </div>
      )}
      {sub && <div className="mono">{sub}</div>}
    </Card>
  );
}

function ProgressBar({ value = 0, ticks = 0, style }) {
  return (
    <div className="progress" style={style}>
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      {ticks > 0 && (
        <div className="ticks">
          {Array.from({ length: ticks }).map((_, i) => <span key={i} />)}
        </div>
      )}
    </div>
  );
}

function Tabs({ items = [], active, onChange, trailing }) {
  return (
    <div className="tabs">
      {items.map((it) => (
        <span
          key={it}
          className={'t ' + (it === active ? 'active' : '')}
          onClick={() => onChange && onChange(it)}>
          {it}
        </span>
      ))}
      {trailing && <span className="t" style={{ marginLeft: 'auto', color: 'var(--green-ink)' }}>{trailing}</span>}
    </div>
  );
}

function PlaceholderBox({ children, height = 120, style }) {
  return (
    <div className="placeholder" style={{ minHeight: height, ...style }}>{children}</div>
  );
}

function FieldRow({ label, value, hint, mono = false }) {
  return (
    <div className="field-row">
      <div className="field-label">
        <MiniLabel>{label}</MiniLabel>
        {hint && <span className="mono mut" style={{ fontSize: 10 }}>{hint}</span>}
      </div>
      <div className={'field-value ' + (mono ? 'mono-val' : '')}>{value}</div>
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="sec-div">
      <span className="line" />
      {label && <span className="lbl">{label}</span>}
      <span className="line" />
    </div>
  );
}

function Crumbs({ children }) {
  return <div className="crumbs">{children}</div>;
}

function PageHead({ crumbs, title, accent, actions }) {
  return (
    <div className="pagehead">
      <div>
        {crumbs && <Crumbs>{crumbs}</Crumbs>}
        <h1>{title} {accent && <span style={{ color: 'var(--green-ink)' }}>{accent}</span>}</h1>
      </div>
      {actions && <div className="row" style={{ gap: 8 }}>{actions}</div>}
    </div>
  );
}

/* Field input — schematic wireframe field. */
function Input({ label, placeholder, value, type = 'text', icon, style }) {
  return (
    <label className="wf-input" style={style}>
      {label && <MiniLabel>{label}</MiniLabel>}
      <div className="wf-input-row">
        {icon && <span className="wf-input-ic">{icon}</span>}
        <span className="wf-input-text">
          {value || <span className="mut">{placeholder}</span>}
        </span>
        <span className="mono mut">{type}</span>
      </div>
    </label>
  );
}

Object.assign(window, {
  Button, Card, Chip, GradeTag, MiniLabel, Avatar,
  KpiCard, ProgressBar, Tabs, PlaceholderBox,
  FieldRow, SectionDivider, Crumbs, PageHead, Input,
});
