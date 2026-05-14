/* =========================================================
   DESKTOP — Marketplace + Pricing Table
   Uses: Sidebar, Topbar
   Exports: Sparkline, Marketplace
   ========================================================= */

const { Sidebar, Topbar } = window;

function Sparkline({ data, down = false }) {
  const w = 90, h = 24;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / ((max - min) || 1)) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const color = down ? '#b94a3a' : '#0f7a3a';
  const last = pts.split(' ').slice(-1)[0].split(',');
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={last[0]} cy={last[1]} r="2" fill={color} />
    </svg>
  );
}

function Marketplace() {
  const rows = [
    { mat: 'PET (Plastic bottle)',  sw: 'p',  price: '24.00', unit: '฿/kg', trend: [10, 11, 9, 12, 11, 13, 14],   dir: 'up',   d: '+8.3%'  },
    { mat: 'HDPE (Milk jug)',       sw: 'p',  price: '18.50', unit: '฿/kg', trend: [14, 13, 13, 12, 12, 11, 11],  dir: 'down', d: '−4.1%'  },
    { mat: 'Office paper · white',  sw: 'pa', price: '7.20',  unit: '฿/kg', trend: [5, 6, 6, 7, 7, 7, 7],         dir: 'up',   d: '+1.4%'  },
    { mat: 'Cardboard',             sw: 'pa', price: '4.10',  unit: '฿/kg', trend: [5, 4, 4, 4, 4, 4, 4],         dir: 'down', d: '−2.2%'  },
    { mat: 'Aluminium cans',        sw: 'al', price: '62.00', unit: '฿/kg', trend: [55, 57, 59, 60, 61, 62, 62],  dir: 'up',   d: '+12.7%' },
    { mat: 'Mixed metal · ferrous', sw: 'm',  price: '9.80',  unit: '฿/kg', trend: [9, 10, 10, 10, 9, 10, 10],    dir: 'up',   d: '+0.6%'  },
    { mat: 'Clear glass',           sw: 'g',  price: '1.40',  unit: '฿/kg', trend: [1, 1, 1, 1, 1, 1, 1],         dir: 'flat', d: '· flat' },
  ];

  const reqs = [
    { name: 'Lung Somchai Recycling', dist: '1.2 km', want: 'PET clear · grade A', qty: '≥ 20 kg', deal: '฿ 26/kg'  },
    { name: 'JJ Market · stall 12',   dist: '2.4 km', want: 'Aluminium cans',      qty: 'any',     deal: '฿ 64/kg'  },
    { name: 'Nimman Café Co-op',      dist: '3.0 km', want: 'Cardboard, bundled',  qty: '≥ 15 kg', deal: '฿ 4.6/kg' },
    { name: 'Doi Saket Scrap',        dist: '8.7 km', want: 'Mixed metal',         qty: 'pickup',  deal: '฿ 10/kg'  },
  ];

  return (
    <div className="ab mkt wf">
      <Topbar active="Marketplace" />
      <Sidebar active="Marketplace" />

      <section className="content">
        {/* LEFT — Pricing Table */}
        <div className="pricing">
          <div className="pagehead">
            <div>
              <div className="crumbs">HOME / MARKETPLACE / PRICING TABLE</div>
              <h1 style={{ fontSize: 28 }}>Today's market — <span style={{ color: 'var(--green-ink)' }}>Chiang Mai</span></h1>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="chip">฿ THB ▾</span>
              <span className="chip">/ kg ▾</span>
            </div>
          </div>

          <div className="tabs">
            <span className="t active">All materials</span>
            <span className="t">Plastic</span>
            <span className="t">Paper</span>
            <span className="t">Metal</span>
            <span className="t">Glass</span>
            <span className="t" style={{ marginLeft: 'auto', color: 'var(--green-ink)' }}>★ My basket (3)</span>
          </div>

          <div style={{
            flex: 1, minHeight: 0, overflow: 'auto',
            border: '1.5px solid var(--line)', borderRadius: 8,
            padding: '4px 14px', background: 'var(--paper)',
          }}>
            <table className="price">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Price</th>
                  <th>7-day trend</th>
                  <th style={{ textAlign: 'right' }}>Δ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={i === 0 ? 'row-active' : ''}>
                    <td className="mat">
                      <span className={'sw ' + r.sw} />
                      <span>{r.mat}</span>
                      {i === 0 && (
                        <span className="chip soft" style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px' }}>in basket</span>
                      )}
                    </td>
                    <td className="price-c">฿ {r.price} <span className="mono mut">{r.unit}</span></td>
                    <td><Sparkline data={r.trend} down={r.dir === 'down'} /></td>
                    <td className={'trend ' + (r.dir === 'down' ? 'down' : '')} style={{ textAlign: 'right' }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="row" style={{ gap: 10 }}>
            <span className="mono">updated 4 min ago · source: 6 buyers</span>
            <span className="mono mut">· auto-refresh ●</span>
            <div className="spacer" style={{ flex: 1 }} />
            <button className="btn ghost">↓ export CSV</button>
            <button className="btn">set price alert</button>
          </div>
        </div>

        {/* RIGHT — P2P Feed + Map */}
        <div className="feed">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: 24 }}>Buying requests — <span style={{ color: 'var(--green-ink)' }}>near you</span></h1>
            <div className="row" style={{ gap: 6 }}>
              <span className="chip">5 km ▾</span>
              <span className="chip">sort: best deal ▾</span>
            </div>
          </div>

          <div className="col" style={{ gap: 10, flex: 1, overflow: 'auto', paddingRight: 4 }}>
            {reqs.map((r, i) => (
              <div key={i} className="req-card">
                <div className="ava">{r.name[0]}</div>
                <div className="body">
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="name">{r.name}</span>
                    <span className="mono">{r.dist}</span>
                  </div>
                  <div className="meta">{r.qty} · pickup window 14:00–18:00</div>
                  <div className="want">wants <b>{r.want}</b></div>
                </div>
                <div className="deal col" style={{ alignItems: 'flex-end', gap: 6 }}>
                  <span className="chip green" style={{ fontSize: 12 }}>{r.deal}</span>
                  <button className="btn primary" style={{ height: 30, fontSize: 16 }}>Deal →</button>
                </div>
              </div>
            ))}
          </div>

          {/* MAP snippet */}
          <div className="map">
            <span className="legend">Smart Map · 1:8k</span>
            <span className="pinp me" style={{ left: '42%', top: '62%' }}>me</span>
            <span className="pinp"    style={{ left: '30%', top: '45%' }}>L. Somchai</span>
            <span className="pinp"    style={{ left: '58%', top: '30%' }}>JJ #12</span>
            <span className="pinp"    style={{ left: '72%', top: '70%' }}>Nimman</span>
            <span className="pinp"    style={{ left: '85%', top: '42%' }}>Doi Saket</span>

            <svg viewBox="0 0 100 100" preserveAspectRatio="none"
                 style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <path d="M42,62 Q35,55 30,45" fill="none" stroke="#0f7a3a" strokeWidth="0.6" strokeDasharray="1.2 1.2" />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { Sparkline, Marketplace });
