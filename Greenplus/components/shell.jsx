/* =========================================================
   SHELL — Sidebar + Topbar (desktop)
   Uses: LogoMark, LogoWordmark
   Exports: Sidebar, Topbar
   ========================================================= */

const { LogoMark, LogoWordmark } = window;

function Sidebar({ active = 'Dashboard' }) {
  const items = [
    { name: 'Dashboard',     hint: 'home'   },
    { name: 'AI Scanner',    hint: 'camera' },
    { name: 'Marketplace',   hint: 'feed'   },
    { name: 'Pricing Table', hint: 'rates'  },
    { name: 'Settings',      hint: 'config' },
  ];
  return (
    <aside className="sidebar">
      <div className="brand" style={{
        padding: '4px 6px 12px',
        borderBottom: '1.5px dashed var(--ink-4)',
        marginBottom: 6,
      }}>
        <LogoMark size={32} />
        <LogoWordmark size={22} />
      </div>
      <div className="nav-h">MAIN</div>
      {items.map((it) => (
        <div key={it.name} className={'nav-item ' + (it.name === active ? 'active' : '')}>
          <span className="ic" />
          <span>{it.name}</span>
          {it.name === active && (
            <span className="chip soft" style={{ marginLeft: 'auto', fontSize: 10, padding: '1px 6px' }}>live</span>
          )}
        </div>
      ))}
      <div className="nav-foot">
        <div className="nav-h" style={{ marginTop: 0 }}>ACCOUNT</div>
        <div className="nav-item"><span className="ic" /><span>Notifications</span></div>
        <div className="nav-item"><span className="ic" /><span>Help & Feedback</span></div>
        <div className="row" style={{ padding: '8px 6px 0', gap: 8 }}>
          <div className="avatar">A</div>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: 16 }}>Anan W.</div>
            <div className="mono">Chiang Mai · ID 8421</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ active = 'Dashboard' }) {
  return (
    <header className="topbar">
      <div className="row" style={{ gap: 10 }}>
        <div className="mono" style={{ fontSize: 11 }}>{active.toUpperCase()}</div>
        <span className="mut" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>/</span>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink)' }}>v0 · wireframe</div>
      </div>
      <div className="search">
        <span className="mag" />
        <span>search materials, shops, deals…</span>
        <span style={{ marginLeft: 'auto' }} className="mono">⌘K</span>
      </div>
      <div className="topright">
        <span className="chip"><span style={{ fontFamily: 'var(--mono)' }}>EN · TH</span></span>
        <div className="ip">
          <span className="dot" />
          <span><b style={{ fontWeight: 700 }}>2,480</b> Impact Pts</span>
        </div>
        <span className="chip green">+ Sell</span>
        <div className="avatar">A</div>
      </div>
    </header>
  );
}

Object.assign(window, { Sidebar, Topbar });
