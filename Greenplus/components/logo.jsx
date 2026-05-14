/* =========================================================
   BRAND — Logo lockups (SVG, token-driven)
   =========================================================
   Components exported to window:
     LogoMark, LogoWordmark
     BrandPanel, CornerLabel
     LogoPrimary, LogoMono, LogoStacked, LogoInverse,
     LogoNav, LogoAppIcon, LogoClearspace
   ========================================================= */

/* Reusable mark — the original "G+" badge.
   Green rounded square, ink border, hand-drawn "G+" inside. */
function LogoMark({ size = 28, inverse = false }) {
  const borderColor = inverse ? '#fafaf7' : 'var(--ink)';
  const radius = Math.round(size * 0.25);
  const fontSize = Math.round(size * 0.64);
  return (
    <span
      aria-label="GreenPlus mark"
      style={{
        width: size, height: size,
        border: `${size >= 48 ? 2.5 : 2}px solid ${borderColor}`,
        background: 'var(--green)',
        display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--hand)',
        fontSize, color: '#062',
        borderRadius: radius,
        boxSizing: 'border-box',
        lineHeight: 1,
      }}
    >
      G<span style={{ marginLeft: -2 }}>+</span>
    </span>
  );
}

function LogoWordmark({ size = 44, inverse = false }) {
  // "inverse" = draw on a permanently-dark surface (admin topbar, dark hero).
  // Use literal light colors, not theme tokens — otherwise in dark mode
  // --paper is dark and "inverse" silently matches the surface.
  const ink   = inverse ? '#fafaf7' : 'var(--ink)';
  const green = inverse ? '#22c55e' : 'var(--green-ink)';
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 0, lineHeight: 1,
      fontFamily: 'var(--hand)', fontWeight: 700, fontSize: size, letterSpacing: '-0.01em'
    }}>
      <span style={{ color: ink }}>Green</span>
      <span style={{ color: green }}>Plus</span>
      <sup style={{
        fontFamily: 'var(--mono)', fontSize: size * 0.26, marginLeft: 6,
        color: ink, opacity: .65, fontWeight: 500, letterSpacing: '.1em', alignSelf: 'center'
      }}>Ai</sup>
    </div>
  );
}

function BrandPanel({ children, dark = false, padded = true, style }) {
  return (
    <div className="wf" style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 18, padding: padded ? 24 : 0,
      background: dark ? '#0e1013' : 'var(--paper)',
      color: dark ? 'var(--paper)' : 'var(--ink)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function CornerLabel({ children }) {
  return (
    <div style={{
      position: 'absolute', top: 10, left: 12,
      fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.12em',
      color: 'var(--ink-3)', textTransform: 'uppercase',
    }}>
      {children}
    </div>
  );
}

function LogoPrimary() {
  return (
    <BrandPanel>
      <CornerLabel>Primary · horizontal lockup</CornerLabel>
      <LogoMark size={72} />
      <LogoWordmark size={48} />
      <div style={{
        position: 'absolute', bottom: 10, right: 14,
        fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)',
      }}>
        ink #1a1a1a · green #22c55e · paper #fafaf7
      </div>
    </BrandPanel>
  );
}

function LogoMono() {
  return (
    <BrandPanel style={{ flexDirection: 'column', gap: 12 }}>
      <CornerLabel>Monogram · favicon · social</CornerLabel>
      <LogoMark size={130} />
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>min size 24px</div>
    </BrandPanel>
  );
}

function LogoStacked() {
  return (
    <BrandPanel style={{ flexDirection: 'column', gap: 14 }}>
      <CornerLabel>Stacked · onboarding</CornerLabel>
      <LogoMark size={96} />
      <LogoWordmark size={36} />
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.18em',
        color: 'var(--ink-3)', textTransform: 'uppercase',
      }}>
        recycle · earn · impact
      </div>
    </BrandPanel>
  );
}

function LogoInverse() {
  return (
    <BrandPanel dark>
      <CornerLabel><span style={{ color: '#9a9a92' }}>Inverse · on dark</span></CornerLabel>
      <LogoMark size={72} inverse />
      <LogoWordmark size={48} inverse />
    </BrandPanel>
  );
}

function LogoNav() {
  return (
    <BrandPanel padded={false} style={{
      padding: '0 16px', justifyContent: 'flex-start', gap: 10,
      borderRight: '1.5px solid var(--line)',
    }}>
      <CornerLabel>Navbar · 56px row</CornerLabel>
      <LogoMark size={32} />
      <LogoWordmark size={22} />
    </BrandPanel>
  );
}

function LogoAppIcon() {
  return (
    <BrandPanel style={{ padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}>
      <CornerLabel>App icon · 1024×1024 squircle</CornerLabel>
      {/* The same G+ mark, scaled up to icon size */}
      <div style={{
        width: 200, height: 200, borderRadius: 46,
        background: 'var(--green)',
        border: '3px solid var(--ink)',
        boxShadow: '4px 4px 0 var(--shadow)',
        position: 'relative', overflow: 'hidden',
        display: 'grid', placeItems: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: .14,
          backgroundImage: 'repeating-linear-gradient(135deg, var(--ink) 0 1px, transparent 1px 10px)',
        }} />
        <span style={{
          fontFamily: 'var(--hand)',
          fontSize: 140, fontWeight: 700,
          color: '#062',
          lineHeight: 1,
          letterSpacing: '-0.08em',
          position: 'relative',
        }}>
          G<span style={{ marginLeft: -10 }}>+</span>
        </span>
      </div>
    </BrandPanel>
  );
}

function LogoClearspace() {
  return (
    <BrandPanel style={{ padding: 30 }}>
      <CornerLabel>Clearspace · X = ¼ mark height</CornerLabel>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          position: 'absolute', inset: -22,
          border: '1.5px dashed var(--ink-3)',
          opacity: .7, pointerEvents: 'none',
        }} />
        {['tl', 'tr', 'bl', 'br'].map((p) => {
          const pos = {
            tl: { top: -26, left: -26 }, tr: { top: -26, right: -26 },
            bl: { bottom: -26, left: -26 }, br: { bottom: -26, right: -26 },
          }[p];
          return <span key={p} className="mono" style={{ position: 'absolute', ...pos, fontSize: 10, color: 'var(--ink-3)' }}>X</span>;
        })}
        <LogoMark size={64} />
        <LogoWordmark size={42} />
      </div>
      <div style={{
        position: 'absolute', bottom: 10, right: 14,
        fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)',
      }}>
        keep X-space clear on all sides
      </div>
    </BrandPanel>
  );
}

Object.assign(window, {
  LogoMark, LogoWordmark, BrandPanel, CornerLabel,
  LogoPrimary, LogoMono, LogoStacked, LogoInverse,
  LogoNav, LogoAppIcon, LogoClearspace,
});
