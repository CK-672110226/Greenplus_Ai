/* =========================================================
   BUYER PAGES — Dashboard (bookings + pricing)
   ========================================================= */

const {
  LogoMark, LogoWordmark, Topbar,
  Button, Card, Chip, GradeTag, MiniLabel, KpiCard, Avatar, Tabs,
  PageHead,
} = window;

function BuyerSidebar({ active = 'Dashboard' }) {
  const items = [
    { name: 'Dashboard',   ic: '◧' },
    { name: 'Marketplace', ic: '◑' },
    { name: 'Pricing',     ic: '฿' },
    { name: 'Profile',     ic: '◐' },
  ];
  return (
    <aside className="sidebar">
      <div className="brand" style={{ padding: '4px 6px 12px', borderBottom: '1.5px dashed var(--ink-4)', marginBottom: 6 }}>
        <LogoMark size={32} />
        <LogoWordmark size={22} />
      </div>
      <div className="nav-h">BUYER</div>
      {items.map(it => (
        <div key={it.name} className={'nav-item ' + (it.name === active ? 'active' : '')}>
          <span className="ic" />
          <span>{it.name}</span>
          {it.name === active && <span className="chip soft" style={{ marginLeft: 'auto', fontSize: 10, padding: '1px 6px' }}>live</span>}
        </div>
      ))}
      <div className="nav-foot">
        <div className="nav-h" style={{ marginTop: 0 }}>SHOP</div>
        <div className="nav-item"><span className="ic" /><span>Settings</span></div>
        <div className="nav-item"><span className="ic" /><span>Sign out</span></div>
        <div className="row" style={{ padding: '8px 6px 0', gap: 8 }}>
          <Avatar initial="S" size={32} />
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: 16 }}>Somchai Scrap</div>
            <div className="mono">buyer · ID 1042</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function BookingRow({ b }) {
  const statusChip = {
    pending:   <Chip>● pending</Chip>,
    accepted:  <Chip variant="green">● accepted</Chip>,
    completed: <Chip variant="soft">● done</Chip>,
    rejected:  <span className="chip" style={{ background: '#ffe2dc', color: '#a83a28', borderColor: '#a83a28' }}>● rejected</span>,
  }[b.status];
  return (
    <div className="booking">
      <Avatar initial={b.user[0]} />
      <div>
        <div className="nm">{b.user} <span className="mono mut" style={{ fontSize: 11 }}>· {b.id}</span></div>
        <div className="meta">{b.items} · {b.kg}kg · pickup {b.when}</div>
      </div>
      <span className="price">฿ {b.value}</span>
      {statusChip}
      <div className="row" style={{ gap: 6 }}>
        {b.status === 'pending' ? (
          <>
            <Button variant="primary" style={{ height: 30, fontSize: 14, padding: '0 12px' }}>Accept</Button>
            <Button variant="ghost"   style={{ height: 30, fontSize: 14, padding: '0 8px' }}>Reject</Button>
          </>
        ) : (
          <Button variant="secondary" style={{ height: 30, fontSize: 14, padding: '0 12px' }}>Details →</Button>
        )}
      </div>
    </div>
  );
}

function BuyerDashboard() {
  const [tab, setTab] = React.useState('Bookings');
  const bookings = [
    { id: '#B-2401', user: 'Anan W.',     items: 'PET, Paper, Al',    kg: 2.5, when: '14:00–15:00 today', value: 78,  status: 'pending'   },
    { id: '#B-2398', user: 'Café Linh',   items: 'Cardboard bundle', kg: 18,  when: '10:00 tomorrow',    value: 92,  status: 'pending'   },
    { id: '#B-2395', user: 'Praew K.',    items: 'Mixed plastic',     kg: 4.1, when: '09:00 today',       value: 64,  status: 'accepted'  },
    { id: '#B-2391', user: 'Anan W.',     items: 'PET 5kg',           kg: 5,   when: 'Mon 12 May',        value: 120, status: 'completed' },
    { id: '#B-2387', user: 'Doi Saket Co.',items:'Aluminium cans',    kg: 8.2, when: '08:30 today',       value: 510, status: 'completed' },
  ];

  return (
    <div className="ab bdash wf">
      <Topbar active="Dashboard" />
      <BuyerSidebar active={tab === 'Pricing' ? 'Pricing' : 'Dashboard'} />

      <main className="main">
        <PageHead
          crumbs="HOME / DASHBOARD"
          title="Somchai Scrap —"
          accent="today's haul"
          actions={[
            <Chip key="d">today ▾</Chip>,
            <Chip key="f">filter: all ▾</Chip>,
            <Button key="x" variant="secondary">↓ Export</Button>,
          ]}
        />

        <div className="stats">
          <KpiCard label="pending" value="2" sub="awaiting accept" />
          <KpiCard label="accepted" value="1" sub="in pickup window" />
          <KpiCard label="completed (7d)" value="14" trend={{ dir: 'up', value: '+22%' }} />
          <KpiCard label="revenue (7d)" value="฿ 4,820" unit="" trend={{ dir: 'up', value: '+18%', note: 'avg ฿344/booking' }} />
        </div>

        <Tabs items={['Bookings', 'Pricing']} active={tab} onChange={setTab} trailing="● 2 new requests" />

        {tab === 'Bookings' ? (
          <Card style={{ padding: '4px 14px' }}>
            <div className="row" style={{ justifyContent: 'space-between', padding: '10px 0 6px', borderBottom: '1.5px solid var(--line)' }}>
              <MiniLabel>5 bookings · sorted by status</MiniLabel>
              <span className="mono mut">id · 64–510 ฿</span>
            </div>
            {bookings.map(b => <BookingRow key={b.id} b={b} />)}
          </Card>
        ) : (
          <Card>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <h3>My buying prices</h3>
                <span className="mono mut">applied to all marketplace listings · per kg · ฿ THB</span>
              </div>
              <Button variant="primary">+ Save prices</Button>
            </div>
            <table className="pricing-table">
              <thead>
                <tr><th>Material</th><th>Grade A</th><th>Grade B</th><th>Grade C</th><th>Cap (kg/day)</th><th /></tr>
              </thead>
              <tbody>
                {[
                  ['PET (clear)',      '24.00', '18.00', '10.00', '200'],
                  ['HDPE',             '18.50', '14.00', '8.00',  '150'],
                  ['Cardboard',        '4.10',  '3.20',  '1.80',  '500'],
                  ['Office paper',     '7.20',  '5.40',  '2.50',  '300'],
                  ['Aluminium cans',   '62.00', '48.00', '30.00', '80'],
                  ['Mixed ferrous',    '9.80',  '7.00',  '4.00',  '100'],
                ].map((r, i) => (
                  <tr key={i}>
                    <td>{r[0]}</td>
                    <td><span className="ed">฿ {r[1]} <span className="mono mut">·</span></span></td>
                    <td><span className="ed">฿ {r[2]} <span className="mono mut">·</span></span></td>
                    <td><span className="ed">฿ {r[3]} <span className="mono mut">·</span></span></td>
                    <td><span className="ed">{r[4]} kg <span className="mono mut">·</span></span></td>
                    <td><span className="mono" style={{ color: 'var(--green-ink)' }}>● live</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mono mut">Tip — increase grade A by 5% to bid competitively for the next 24h.</div>
          </Card>
        )}
      </main>
    </div>
  );
}

Object.assign(window, { BuyerDashboard, BuyerSidebar });
