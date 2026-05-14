/* =========================================================
   MOBILE — Phone frame + 4 screens
   Uses: LogoMark, LogoWordmark
   Exports: PhoneFrame, StatusBar, MHead, MTabbar,
            MobileHome, MobileScan, MobilePrices, MobileMarket
   ========================================================= */

const { LogoMark, LogoWordmark } = window;

function PhoneFrame({ children }) {
  return (
    <div className="phone">
      <span className="notch" />
      <div className="screen">{children}</div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <div className="ind">
        <span>●●●●</span>
        <span>5G</span>
        <span className="bat"><i /></span>
      </div>
    </div>
  );
}

function MHead({ showIp = true }) {
  return (
    <div className="m-head">
      <div className="brand">
        <LogoMark size={28} />
        <LogoWordmark size={20} />
      </div>
      {showIp && (
        <div className="ip">
          <span className="dot" />
          <span><b style={{ fontWeight: 700 }}>2,480</b> pts</span>
        </div>
      )}
      <div className="avatar">A</div>
    </div>
  );
}

function MTabbar({ active = 'home' }) {
  const items = [
    { id: 'home',   label: 'Home'   },
    { id: 'market', label: 'Market' },
    { id: 'scan',   label: 'Scan', scan: true },
    { id: 'me',     label: 'Me'     },
  ];
  return (
    <nav className="tabbar">
      {items.map((it) => (
        <div key={it.id} className={'ti ' + (it.scan ? 'scan ' : '') + (it.id === active ? 'active' : '')}>
          <span className="ic">{it.scan ? '+' : ''}</span>
          <span>{it.label}</span>
        </div>
      ))}
    </nav>
  );
}

function MobileHome() {
  return (
    <PhoneFrame>
      <StatusBar />
      <MHead />
      <div className="m-body">
        <div>
          <div className="mono">MORNING, ANAN</div>
          <h1>Good haul this week — <span style={{ color: 'var(--green-ink)' }}>12.4 kg</span></h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="m-card">
            <div className="mini-label">earnings</div>
            <div className="kpi">฿286 <small>thb</small></div>
            <div className="mono" style={{ color: 'var(--green-ink)' }}>▲ ฿42 wk</div>
          </div>
          <div className="m-card">
            <div className="mini-label">impact pts</div>
            <div className="kpi">2,480 <small>pts</small></div>
            <div className="progress" style={{ marginTop: 2 }}>
              <i style={{ width: '68%' }} />
            </div>
          </div>
        </div>

        <div className="m-card" style={{ minHeight: 120 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2>Weekly impact</h2>
            <span className="mono">7d</span>
          </div>
          <svg viewBox="0 0 320 90" preserveAspectRatio="none" style={{ width: '100%', height: 90 }}>
            <defs>
              <pattern id="hg-m" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#22c55e" strokeWidth="2" />
              </pattern>
            </defs>
            <line x1="0" y1="80" x2="320" y2="80" stroke="currentColor" strokeWidth="1.2" opacity=".3" />
            {[[15, 42], [60, 28], [105, 38], [150, 18], [195, 40], [240, 12], [285, 28]].map(([x, h], i) => (
              <rect key={i} x={x - 12} y={80 - h} width="24" height={h} fill="url(#hg-m)" stroke="#0f7a3a" strokeWidth="1.2" />
            ))}
          </svg>
        </div>

        <div>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
            <h2>Recent scans</h2>
            <span className="mono mut">view all →</span>
          </div>
          <div className="m-card" style={{ padding: '0 12px' }}>
            {[
              { mat: 'PET bottle · 0.8kg',  meta: '2m ago · Suthep', grade: 'A', price: '฿16', tint: 'var(--green-soft)' },
              { mat: 'Paper · 1.4kg',       meta: '1h ago',          grade: 'B', price: '฿11', tint: 'var(--paper-2)'    },
              { mat: 'Aluminium · 0.3kg',   meta: 'yesterday',       grade: 'A', price: '฿42', tint: 'var(--paper-2)'    },
            ].map((r, i) => (
              <div key={i} className="m-row">
                <div style={{ width: 32, height: 32, border: '1.5px solid var(--line)', borderRadius: 6, background: r.tint }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--label)', fontSize: 16 }}>{r.mat}</div>
                  <div className="mono">{r.meta}</div>
                </div>
                <span className="chip soft">{r.grade}</span>
                <span className="mono" style={{ fontWeight: 600 }}>{r.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="m-card" style={{ background: 'var(--green-soft)', borderColor: 'var(--green-ink)' }}>
          <div className="row" style={{ gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              border: '1.5px solid var(--green-ink)', background: 'var(--green)',
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--hand)', color: '#062', fontSize: 22,
            }}>!</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--hand)', fontSize: 18, fontWeight: 700, color: 'var(--green-ink)' }}>3 buyers near you</div>
              <div className="mono" style={{ color: 'var(--ink-2)' }}>Best deal · ฿26/kg PET · 1.2 km</div>
            </div>
            <span className="mono" style={{ color: 'var(--green-ink)' }}>→</span>
          </div>
        </div>
      </div>
      <MTabbar active="home" />
    </PhoneFrame>
  );
}

function MobileScan() {
  return (
    <PhoneFrame>
      <StatusBar />
      <div className="m-body" style={{ padding: '10px 12px 0', gap: 10 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="mono mut">← back</span>
          <span className="mono">camera 1 · flash auto</span>
          <span className="mono mut">batch</span>
        </div>

        <div className="m-scan-stage">
          <span className="vf-corner tl" />
          <span className="vf-corner tr" />
          <span className="vf-corner bl" />
          <span className="vf-corner br" />
          <div className="scanline" />

          <div className="m-overlay">
            <span className="chip-dark">● live · 30fps</span>
            <span className="chip-dark"
                  style={{ background: 'rgba(34,197,94,.85)', color: '#062', borderColor: 'transparent' }}>
              stage 1 of 2
            </span>
          </div>

          <div className="object">
            <div className="bbox">
              <i /><b />
              <span className="label">PET · 98%</span>
            </div>
            <div className="bottle" />
          </div>

          <div style={{ position: 'absolute', left: 12, bottom: 12, fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,.7)' }}>
            ↕ 24cm · ⌀ 6.5cm · 0.82kg
          </div>
          <div style={{ position: 'absolute', right: 12, bottom: 12, fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,.7)' }}>
            47ms · v2.1
          </div>
        </div>

        <div className="m-sheet">
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 6 }}>
            <h2 style={{ fontSize: 20 }}>Plastic bottle (PET)</h2>
            <span className="chip soft">Grade A · 98%</span>
          </div>

          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="mini-label">contamination</span>
            <span className="mono">12% · low</span>
          </div>
          <div className="progress">
            <i style={{ width: '12%' }} />
            <div className="ticks"><span /><span /><span /></div>
          </div>

          <div className="calc" style={{ margin: '2px 0' }}>
            <div className="row"><span>0.82 kg × ฿24/kg × 1.00</span><span className="total">฿ 22.10</span></div>
            <div className="mono" style={{ marginTop: 2 }}>+18 impact pts · 0.31kg CO₂ saved</div>
          </div>

          <div className="row-flex">
            <button className="btn">↺ retake</button>
            <button className="btn primary" style={{ flex: 2 }}>✓ Add to basket (4)</button>
          </div>
        </div>
      </div>
      <MTabbar active="scan" />
    </PhoneFrame>
  );
}

function MobilePrices() {
  const rows = [
    { mat: 'PET (clear)',    sub: 'plastic · food-grade', sw: 'p',  price: '24.00', d: '+8.3%',  dir: 'up'   },
    { mat: 'HDPE',           sub: 'plastic · milk jug',   sw: 'p',  price: '18.50', d: '−4.1%',  dir: 'down' },
    { mat: 'Aluminium cans', sub: 'metal',                sw: 'al', price: '62.00', d: '+12.7%', dir: 'up'   },
    { mat: 'Office paper',   sub: 'paper · white',        sw: 'pa', price: '7.20',  d: '+1.4%',  dir: 'up'   },
    { mat: 'Cardboard',      sub: 'paper',                sw: 'pa', price: '4.10',  d: '−2.2%',  dir: 'down' },
    { mat: 'Mixed ferrous',  sub: 'metal',                sw: 'al', price: '9.80',  d: '+0.6%',  dir: 'up'   },
    { mat: 'Clear glass',    sub: 'glass',                sw: 'pa', price: '1.40',  d: '· flat', dir: 'flat' },
  ];
  return (
    <PhoneFrame>
      <StatusBar />
      <MHead showIp={false} />
      <div className="m-body">
        <div>
          <div className="mono">CHIANG MAI · TODAY</div>
          <h1>Market — <span style={{ color: 'var(--green-ink)' }}>฿ /kg</span></h1>
        </div>

        <div className="m-seg">
          <span className="s on">All</span>
          <span className="s">Plastic</span>
          <span className="s">Paper</span>
          <span className="s">Metal</span>
          <span className="s">Glass</span>
        </div>

        <div className="m-card" style={{ padding: '4px 12px' }}>
          {rows.map((r, i) => (
            <div key={i} className="m-price-row" style={i === rows.length - 1 ? { borderBottom: 0 } : null}>
              <span className={'sw ' + r.sw} />
              <div>
                <div className="name">{r.mat}</div>
                <div className="sub">{r.sub}</div>
              </div>
              <div>
                <div className="price">฿ {r.price}</div>
                <div className={'delta ' + (r.dir === 'down' ? 'down' : '')}>{r.d}</div>
              </div>
              <span className="mono mut">→</span>
            </div>
          ))}
        </div>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="mono">updated 4 min ago</span>
          <span className="mono" style={{ color: 'var(--green-ink)' }}>● auto-refresh</span>
        </div>
      </div>
      <MTabbar active="market" />
    </PhoneFrame>
  );
}

function MobileMarket() {
  const reqs = [
    { name: 'Lung Somchai Recycling', dist: '1.2 km', want: 'PET clear · A', qty: '≥ 20 kg', deal: '฿ 26/kg'  },
    { name: 'JJ Market · stall 12',   dist: '2.4 km', want: 'Aluminium cans', qty: 'any',     deal: '฿ 64/kg'  },
    { name: 'Nimman Café Co-op',      dist: '3.0 km', want: 'Cardboard',      qty: '≥ 15 kg', deal: '฿ 4.6/kg' },
    { name: 'Doi Saket Scrap',        dist: '8.7 km', want: 'Mixed metal',    qty: 'pickup',   deal: '฿ 10/kg'  },
  ];
  return (
    <PhoneFrame>
      <StatusBar />
      <MHead showIp={false} />
      <div className="m-body">
        <div>
          <div className="mono">NEAR YOU · 5 km</div>
          <h1>Buying requests</h1>
        </div>

        <div className="map" style={{ height: 160, marginBottom: 2 }}>
          <span className="legend">smart map · 1:8k</span>
          <span className="pinp me" style={{ left: '42%', top: '62%' }}>me</span>
          <span className="pinp"    style={{ left: '30%', top: '45%' }}>Somchai</span>
          <span className="pinp"    style={{ left: '58%', top: '30%' }}>JJ #12</span>
          <span className="pinp"    style={{ left: '72%', top: '70%' }}>Nimman</span>
        </div>

        <div className="m-seg">
          <span className="s on">Best deal</span>
          <span className="s">Nearest</span>
          <span className="s">New</span>
        </div>

        <div className="col" style={{ gap: 10 }}>
          {reqs.map((r, i) => (
            <div key={i} className="m-req">
              <div className="ava">{r.name[0]}</div>
              <div className="body">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="name">{r.name}</span>
                  <span className="mono">{r.dist}</span>
                </div>
                <div className="meta">{r.qty} · pickup 14–18:00</div>
                <div className="want">wants <b>{r.want}</b></div>
              </div>
              <span className="deal">{r.deal}</span>
            </div>
          ))}
        </div>
      </div>
      <MTabbar active="market" />
    </PhoneFrame>
  );
}

Object.assign(window, {
  PhoneFrame, StatusBar, MHead, MTabbar,
  MobileHome, MobileScan, MobilePrices, MobileMarket,
});
