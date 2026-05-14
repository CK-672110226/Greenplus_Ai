/* =========================================================
   USER MOBILE PAGES — Basket, Map, Profile, Settings, EcoPoints
   ========================================================= */

const {
  PhoneFrame, StatusBar, MHead, MTabbar,
  Button, Card, Chip, GradeTag, MiniLabel, ProgressBar, Avatar,
  SectionDivider, Input,
} = window;

/* ---------- Basket ---------- */
function MobileBasket() {
  const items = [
    { mat: 'PET bottle',  kg: 0.8, grade: 'A', price: '฿16',  skipped: false },
    { mat: 'Cardboard',   kg: 1.4, grade: 'B', price: '฿11',  skipped: false },
    { mat: 'Aluminium',   kg: 0.3, grade: 'A', price: '฿42',  skipped: false },
    { mat: 'Mixed paper', kg: 0.6, grade: 'C', price: '฿3',   skipped: true  },
  ];
  return (
    <PhoneFrame>
      <StatusBar />
      <MHead showIp={false} />
      <div className="m-body">
        <div>
          <div className="mono">BASKET · 3 of 4 active</div>
          <h1>฿ 69 <span style={{ color: 'var(--green-ink)', fontSize: 22, fontFamily: 'var(--label)' }}>estimated</span></h1>
        </div>

        <div className="m-card" style={{ padding: '0 12px' }}>
          {items.map((it, i) => (
            <div key={i} className="m-row" style={{ opacity: it.skipped ? 0.4 : 1 }}>
              <div style={{ width: 32, height: 32, border: '1.5px solid var(--line)', borderRadius: 6, background: it.skipped ? 'var(--paper-2)' : 'var(--green-soft)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--label)', fontSize: 16, textDecoration: it.skipped ? 'line-through' : 'none' }}>{it.mat}</div>
                <div className="mono">{it.kg} kg · {it.skipped ? 'skipped' : 'in basket'}</div>
              </div>
              <GradeTag grade={it.grade} />
              <span className="mono" style={{ fontWeight: 600, minWidth: 36, textAlign: 'right' }}>{it.price}</span>
            </div>
          ))}
        </div>

        <SectionDivider label="route" />

        <div className="m-card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <MiniLabel>Pickup options</MiniLabel>
            <Chip variant="soft">GPS · 0.0km</Chip>
          </div>

          <div className="row stroke" style={{ padding: 10, borderRadius: 8, gap: 10, justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'var(--label)', fontSize: 16, fontWeight: 600 }}>Single shop</div>
              <div className="mono">Lung Somchai · 1.2 km · ฿65 total</div>
            </div>
            <span className="mono" style={{ color: 'var(--ink-3)' }}>→</span>
          </div>
          <div className="row stroke" style={{ padding: 10, borderRadius: 8, gap: 10, justifyContent: 'space-between', borderColor: 'var(--green-ink)', background: 'var(--green-soft)' }}>
            <div>
              <div style={{ fontFamily: 'var(--label)', fontSize: 16, fontWeight: 600, color: 'var(--green-ink)' }}>Multi-stop ★ best</div>
              <div className="mono">3 shops · 4.1 km loop · ฿78 total</div>
            </div>
            <span className="mono" style={{ color: 'var(--green-ink)' }}>→</span>
          </div>
        </div>

        <Button variant="primary" fullWidth style={{ height: 46, fontSize: 19 }}>Book pickup · ฿ 78 →</Button>
        <Button variant="ghost" fullWidth>Clear basket</Button>
      </div>
      <MTabbar active="home" />
    </PhoneFrame>
  );
}

/* ---------- Map ---------- */
function MobileMap() {
  const shops = [
    { name: 'Lung Somchai', dist: '1.2km', acc: 'PET, paper',  x: '38%', y: '58%' },
    { name: 'JJ Market #12', dist: '2.4km', acc: 'metal',       x: '58%', y: '30%' },
    { name: 'Nimman Co-op',  dist: '3.0km', acc: 'cardboard',   x: '72%', y: '70%' },
  ];
  return (
    <PhoneFrame>
      <StatusBar />
      <MHead showIp={false} />
      <div className="m-body" style={{ padding: 0, gap: 0 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1.5px solid var(--line)' }}>
          <MiniLabel>NEARBY · 5 km radius</MiniLabel>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
            <h2 style={{ fontSize: 22 }}>Recyclers near you</h2>
            <Chip>list ▾</Chip>
          </div>
        </div>

        <div className="map" style={{ height: 280, borderRadius: 0, border: 'none', borderBottom: '1.5px solid var(--line)', boxShadow: 'none' }}>
          <span className="legend">leaflet · OSM</span>
          <span className="pinp me" style={{ left: '50%', top: '50%' }}>me</span>
          {shops.map(s => (
            <span key={s.name} className="pinp" style={{ left: s.x, top: s.y }}>{s.name.split(' ')[0]}</span>
          ))}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="35" fill="none" stroke="var(--green-ink)" strokeWidth="0.4" strokeDasharray="1 1.5" />
          </svg>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shops.map(s => (
            <div key={s.name} className="m-listcard">
              <div className="h">
                <div className="ic">♻</div>
                <div style={{ flex: 1 }}>
                  <div className="nm">{s.name}</div>
                  <div className="meta">{s.dist} · accepts {s.acc}</div>
                </div>
                <Chip variant="soft">open</Chip>
              </div>
              <div className="row" style={{ gap: 8, marginTop: 4 }}>
                <Button variant="secondary" style={{ flex: 1, height: 32, fontSize: 15 }}>Directions ↗</Button>
                <Button variant="primary"   style={{ flex: 1, height: 32, fontSize: 15 }}>Book pickup</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <MTabbar active="market" />
    </PhoneFrame>
  );
}

/* ---------- Eco Points ---------- */
function MobileEcoPoints() {
  return (
    <PhoneFrame>
      <StatusBar />
      <MHead showIp={false} />
      <div className="m-body">
        <div>
          <MiniLabel>ECO POINTS</MiniLabel>
          <h1>2,480 <span style={{ color: 'var(--green-ink)', fontSize: 22, fontFamily: 'var(--label)' }}>· Gold tier</span></h1>
        </div>

        <div className="m-card" style={{ background: 'var(--green-soft)', borderColor: 'var(--green-ink)' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <MiniLabel style={{ color: 'var(--green-ink)' }}>NEXT TIER · PLATINUM</MiniLabel>
            <span className="mono" style={{ fontWeight: 600, color: 'var(--green-ink)' }}>520 pts to go</span>
          </div>
          <ProgressBar value={68} ticks={4} />
          <div className="mono mut" style={{ color: 'var(--ink-2)' }}>Hit 3,000 pts for ×1.1 multiplier on every scan</div>
        </div>

        <div>
          <h2>History</h2>
          <div className="m-card" style={{ padding: '6px 14px' }}>
            <div className="timeline">
              {[
                { t: 'Scan · PET 0.8kg',      v: '+18', sub: '2m ago'   },
                { t: 'Booking confirmed',     v: '+25', sub: '1h ago'   },
                { t: 'Multi-stop bonus',      v: '+40', sub: 'yest.'    },
                { t: 'Daily streak · 7 days', v: '+50', sub: '3 days'   },
                { t: 'Scan · Aluminium 0.3kg',v: '+12', sub: '5 days'   },
              ].map((row, i) => (
                <div key={i} className="timeline-item">
                  <div>
                    <div className="t">{row.t}</div>
                    <div className="mono mut" style={{ fontSize: 10 }}>{row.sub}</div>
                  </div>
                  <span className="v">{row.v} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button variant="secondary" fullWidth>How points work →</Button>

        <div>
          <h2>Tier system</h2>
          <div className="m-card" style={{ padding: 0, overflow: 'hidden' }}>
            {[
              { tier: 'Bronze',   range: '0–999',       mult: '×1.0',  active: false },
              { tier: 'Silver',   range: '1,000–1,999', mult: '×1.05', active: false },
              { tier: 'Gold',     range: '2,000–2,999', mult: '×1.1',  active: true  },
              { tier: 'Platinum', range: '3,000+',      mult: '×1.15', active: false },
            ].map((t, i, a) => (
              <div key={t.tier}
                   style={{
                     display: 'grid', gridTemplateColumns: '80px 1fr auto',
                     gap: 10, alignItems: 'center',
                     padding: '12px 14px',
                     borderBottom: i === a.length - 1 ? 0 : '1.5px dashed var(--ink-4)',
                     background: t.active ? 'var(--green-soft)' : 'transparent',
                   }}>
                <div className="row" style={{ gap: 6 }}>
                  {t.active && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-ink)' }} />}
                  <span style={{ fontFamily: 'var(--hand)', fontSize: 16, fontWeight: 700,
                                 color: t.active ? 'var(--green-ink)' : 'var(--ink)' }}>{t.tier}</span>
                </div>
                <span className="mono mut">{t.range} pts</span>
                <span className="mono" style={{ fontWeight: 600, color: t.active ? 'var(--green-ink)' : 'var(--ink-2)' }}>
                  {t.mult}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <MTabbar active="me" />
    </PhoneFrame>
  );
}

/* ---------- Profile ---------- */
function MobileProfile() {
  return (
    <PhoneFrame>
      <StatusBar />
      <MHead showIp={false} />
      <div className="m-body">
        <div className="row" style={{ gap: 14 }}>
          <Avatar initial="A" size={64} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, margin: 0 }}>Anan W.</h2>
            <div className="mono">user · Chiang Mai · ID 8421</div>
            <Chip variant="soft" style={{ marginTop: 4 }}>verified ✓ · since Apr 2026</Chip>
          </div>
        </div>

        <div className="m-card">
          <MiniLabel>Lifetime impact</MiniLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 6 }}>
            <div>
              <div className="kpi" style={{ fontSize: 22 }}>248 <small>kg</small></div>
              <div className="mono mut">recycled</div>
            </div>
            <div>
              <div className="kpi" style={{ fontSize: 22 }}>฿ 4.2k</div>
              <div className="mono mut">earned</div>
            </div>
            <div>
              <div className="kpi" style={{ fontSize: 22 }}>91 <small>kg</small></div>
              <div className="mono mut">CO₂ saved</div>
            </div>
          </div>
        </div>

        <div>
          <h2>Scan history</h2>
          <div className="m-card" style={{ padding: '0 12px' }}>
            {[
              ['PET bottle',  '0.8kg', 'A', '2m ago'],
              ['Paper',       '1.4kg', 'B', '1h ago'],
              ['Aluminium',   '0.3kg', 'A', 'yest.'],
              ['HDPE',        '0.5kg', 'B', '2 days'],
            ].map((r, i) => (
              <div key={i} className="m-row">
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--label)', fontSize: 16 }}>{r[0]} · {r[1]}</div>
                  <div className="mono">{r[3]}</div>
                </div>
                <GradeTag grade={r[2]} />
              </div>
            ))}
          </div>
        </div>

        <div className="m-card" style={{ padding: '6px 14px' }}>
          {[
            ['Eco-points',  '2,480 pts · Gold'],
            ['Settings',    'language · dark mode'],
            ['Help & FAQ',  'support@greenplus.ai'],
            ['Sign out',    null],
          ].map((r, i) => (
            <div key={i} className="m-row" style={{ paddingTop: 12, paddingBottom: 12 }}>
              <span style={{ flex: 1, fontFamily: 'var(--label)', fontSize: 17 }}>{r[0]}</span>
              {r[1] && <span className="mono mut">{r[1]}</span>}
              <span className="mono">→</span>
            </div>
          ))}
        </div>
      </div>
      <MTabbar active="me" />
    </PhoneFrame>
  );
}

/* ---------- Settings ---------- */
function MobileSettings() {
  const Row = ({ label, value, control = '→' }) => (
    <div className="m-row" style={{ paddingTop: 12, paddingBottom: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--label)', fontSize: 17 }}>{label}</div>
        {value && <div className="mono mut">{value}</div>}
      </div>
      <span className="mono">{control}</span>
    </div>
  );
  return (
    <PhoneFrame>
      <StatusBar />
      <MHead showIp={false} />
      <div className="m-body">
        <div>
          <MiniLabel>SETTINGS</MiniLabel>
          <h1>Preferences</h1>
        </div>

        <SectionDivider label="appearance" />
        <div className="m-card" style={{ padding: '6px 14px' }}>
          <div className="m-row" style={{ paddingTop: 12, paddingBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--label)', fontSize: 17 }}>Dark mode</div>
              <div className="mono mut">match system / always on / off</div>
            </div>
            <span style={{
              width: 40, height: 22, borderRadius: 99,
              background: 'var(--green)', border: '1.5px solid var(--green-ink)',
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute', top: 1, right: 1, width: 18, height: 18,
                background: 'var(--paper)', borderRadius: '50%',
              }} />
            </span>
          </div>
          <Row label="Language" value="ไทย · EN" />
          <Row label="Units" value="metric · kg / km" />
        </div>

        <SectionDivider label="notifications" />
        <div className="m-card" style={{ padding: '6px 14px' }}>
          <Row label="Price alerts" value="2 active" />
          <Row label="Pickup reminders" value="on · 30min before" />
          <Row label="Marketing" value="off" />
        </div>

        <SectionDivider label="account" />
        <div className="m-card" style={{ padding: '6px 14px' }}>
          <Row label="Linked accounts" value="Google · LINE" />
          <Row label="Export my data" />
          <Row label="Delete account" value="permanent · 30-day grace" />
        </div>

        <div className="mono mut" style={{ textAlign: 'center' }}>v0.4.2 · build 428</div>
      </div>
      <MTabbar active="me" />
    </PhoneFrame>
  );
}

Object.assign(window, {
  MobileBasket, MobileMap, MobileEcoPoints, MobileProfile, MobileSettings,
});
