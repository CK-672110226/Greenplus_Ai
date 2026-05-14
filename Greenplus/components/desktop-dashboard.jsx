/* =========================================================
   DESKTOP — Dashboard (Shell layout)
   Uses: Sidebar, Topbar
   Exports: Shell
   ========================================================= */

const { Sidebar, Topbar } = window;

function Shell() {
  return (
    <div className="ab shell wf">
      <Topbar active="Dashboard" />
      <div className="body">
        <Sidebar active="Dashboard" />

        <main className="main">
          {/* 12-col ruler */}
          <div className="ruler">
            {Array.from({ length: 12 }).map((_, i) =>
              <span key={i}>{String(i + 1).padStart(2, '0')}</span>
            )}
          </div>

          <div className="pagehead">
            <div>
              <div className="crumbs">HOME / DASHBOARD</div>
              <h1>Hello, Anan — <span style={{ color: 'var(--green-ink)' }}>good haul this week.</span></h1>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <span className="chip">last 7 days ▾</span>
              <span className="chip">CM / Suthep ▾</span>
              <button className="btn primary">+ New Scan</button>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid12">
            <div className="col-4 card">
              <div className="mini-label">This week · kg recycled</div>
              <div className="kpi">12.4 <small>kg</small></div>
              <div className="row mono"><span style={{ color: 'var(--green-ink)' }}>▲ 18%</span><span>vs last week</span></div>
            </div>
            <div className="col-4 card">
              <div className="mini-label">Earnings</div>
              <div className="kpi">฿ 286 <small>thb</small></div>
              <div className="row mono"><span style={{ color: 'var(--green-ink)' }}>▲ ฿42</span><span>pending payout ฿180</span></div>
            </div>
            <div className="col-4 card">
              <div className="mini-label">Impact points</div>
              <div className="kpi">2,480 <small>pts</small></div>
              <div className="progress" style={{ marginTop: 4 }}>
                <i style={{ width: '68%' }} />
              </div>
              <div className="mono">Gold tier · 520 to Platinum</div>
            </div>

            <div className="col-8 card" style={{ minHeight: 280 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h3>Active feature — Weekly impact</h3>
                <span className="mono">[ main content slot · 8 cols ]</span>
              </div>
              <div className="placeholder" style={{ minHeight: 200, position: 'relative' }}>
                <svg viewBox="0 0 400 160" preserveAspectRatio="none"
                     style={{ position: 'absolute', inset: 14, width: 'calc(100% - 28px)', height: 'calc(100% - 28px)' }}>
                  <defs>
                    <pattern id="hatchg" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#22c55e" strokeWidth="2" />
                    </pattern>
                  </defs>
                  <line x1="0" y1="140" x2="400" y2="140" stroke="#1a1a1a" strokeWidth="1.5" />
                  {[[20, 90], [80, 60], [140, 70], [200, 40], [260, 80], [320, 30], [380, 55]].map(([x, h], i) => (
                    <g key={i}>
                      <rect x={x - 16} y={140 - h} width="32" height={h} fill="url(#hatchg)" stroke="#0f7a3a" strokeWidth="1.5" />
                      <text x={x} y="155" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" fill="#7a7a7a">d{i + 1}</text>
                    </g>
                  ))}
                  <polyline points="20,80 80,55 140,65 200,45 260,70 320,35 380,50"
                            fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="3 3" />
                </svg>
              </div>
            </div>

            <div className="col-4 card" style={{ minHeight: 280 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h3>Quick actions</h3>
                <span className="mono">4 cols</span>
              </div>
              {[
                'Scan an item',
                'Open marketplace',
                'See today\u2019s prices',
                'Find a nearby buyer',
              ].map((t, i) => (
                <div key={i} className="row stroke"
                     style={{ padding: '9px 10px', borderRadius: 6, justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--label)', fontSize: 17 }}>{t}</span>
                  <span className="mono">→</span>
                </div>
              ))}
              <button className="btn ghost" style={{ marginTop: 'auto' }}>see all shortcuts</button>
            </div>

            <div className="col-6 card">
              <h3>Recent scans</h3>
              {[
                ['PET bottle · 0.8kg', 'Grade A', '฿16', '2m ago'],
                ['Paper · 1.4kg',      'Grade B', '฿11', '1h ago'],
                ['Aluminium · 0.3kg',  'Grade A', '฿42', 'Yest.'],
              ].map((r, i) => (
                <div key={i} className="row"
                     style={{ justifyContent: 'space-between', padding: '6px 0', borderBottom: '1.5px dashed var(--ink-4)' }}>
                  <span style={{ fontFamily: 'var(--label)', fontSize: 17 }}>{r[0]}</span>
                  <span className="chip soft">{r[1]}</span>
                  <span className="mono" style={{ minWidth: 48, textAlign: 'right' }}>{r[2]}</span>
                  <span className="mono mut">{r[3]}</span>
                </div>
              ))}
            </div>

            <div className="col-6 card">
              <h3>Nearby buying requests</h3>
              <div className="placeholder" style={{ minHeight: 120 }}>[ p2p feed snippet · click to open Marketplace ]</div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="mono">3 active · within 4km</span>
                <button className="btn ghost">view all →</button>
              </div>
            </div>
          </div>

          <div className="ann" style={{ top: 80, right: 24, width: 130, textAlign: 'right' }}>
            <b>impact pts</b> live in header — visible from every screen
            <span className="arrow" style={{ marginLeft: 'auto', transform: 'rotate(180deg)' }} />
          </div>
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { Shell });
