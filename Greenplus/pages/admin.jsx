/* =========================================================
   ADMIN — /admin (5 tabs: Shops / Heatmap / AI Config / AI Studio / Moderation)
   ========================================================= */

const {
  LogoMark, LogoWordmark,
  Button, Card, Chip, GradeTag, MiniLabel, Avatar, Input, SectionDivider
} = window;

function AdminTopbar() {
  return (
    <header className="topbar">
      <LogoMark size={28} />
      <LogoWordmark size={20} inverse />
      <span className="x">● ADMIN · RESTRICTED</span>
      <span className="mono" style={{ marginLeft: 12, opacity: .7 }}>session · 47 min</span>
      <div style={{ marginLeft: 'auto' }} className="row">
        <span className="mono">build #428 · 13 May</span>
        <Avatar initial="K" size={28} />
      </div>
    </header>);

}

function AdminSidebar({ active, onSelect }) {
  const items = [
  { id: 'shops', label: 'Shops', badge: '4 pending' },
  { id: 'heatmap', label: 'Heatmap', badge: null },
  { id: 'ai-config', label: 'AI Model Config', badge: null },
  { id: 'ai-studio', label: 'AI Studio', badge: 'C-07' },
  { id: 'moderation', label: 'Moderation', badge: '2 flagged' }];

  return (
    <aside className="sidebar">
      <div className="nav-h" style={{ marginTop: 0 }}>CONSOLE</div>
      {items.map((it) =>
      <div key={it.id}
      className={'ai ' + (it.id === active ? 'active' : '')}
      onClick={() => onSelect(it.id)}>
          <span>{it.label}</span>
          {it.badge &&
        <span className="chip" style={{
          marginLeft: 'auto', fontSize: 10, padding: '1px 6px',
          background: it.id === active ? 'transparent' : 'var(--green-soft)',
          borderColor: it.id === active ? 'currentColor' : 'var(--green-ink)',
          color: it.id === active ? 'inherit' : 'var(--green-ink)'
        }}>{it.badge}</span>
        }
        </div>
      )}
      <div className="nav-foot">
        <div className="nav-h" style={{ marginTop: 0 }}>SYSTEM</div>
        <div className="ai"><span>Audit log</span></div>
        <div className="ai"><span>Sign out</span></div>
      </div>
    </aside>);

}

/* ---------- Shops tab ---------- */
function AdminShops() {
  const pending = [
  { name: 'Lung Decha Recycling', owner: 'Decha P.', loc: 'San Sai', reg: '2 days ago', docs: '3/3' },
  { name: 'Saleng Tao', owner: 'Tao M.', loc: 'Mae Rim', reg: '4 hours ago', docs: '2/3' },
  { name: 'JJ Market #14', owner: 'Wat L.', loc: 'Muang', reg: 'yesterday', docs: '3/3' },
  { name: 'Doi Saket Scrap Co.', owner: 'Anong S.', loc: 'Doi Saket', reg: '1 hour ago', docs: '1/3' }];

  const active = [
  { name: 'Lung Somchai Recycling', scans: 248, rev: '฿ 12,480', flag: null },
  { name: 'Nimman Café Co-op', scans: 92, rev: '฿  4,610', flag: null },
  { name: 'JJ Market #12', scans: 184, rev: '฿  9,200', flag: 'review' }];

  return (
    <>
      <Card>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <MiniLabel>PENDING APPROVAL · 4</MiniLabel>
            <h3>New shop applications</h3>
          </div>
          <Chip variant="soft">verify docs before approving</Chip>
        </div>
        <table className="pricing-table">
          <thead>
            <tr><th>Shop</th><th>Owner</th><th>Location</th><th>Docs</th><th>Registered</th><th /></tr>
          </thead>
          <tbody>
            {pending.map((p, i) =>
            <tr key={i}>
                <td>{p.name}</td>
                <td className="mono" style={{ fontSize: 13 }}>{p.owner}</td>
                <td className="mono" style={{ fontSize: 13 }}>{p.loc}</td>
                <td>
                  <Chip variant={p.docs === '3/3' ? 'soft' : 'default'}>{p.docs}</Chip>
                </td>
                <td className="mono mut" style={{ fontSize: 12 }}>{p.reg}</td>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    <Button variant="primary" style={{ height: 28, fontSize: 13, padding: '0 10px' }}>Approve</Button>
                    <Button variant="ghost" style={{ height: 28, fontSize: 13, padding: '0 8px' }}>Reject</Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3>Active shops · {active.length}</h3>
          <Input placeholder="search shops..." icon style={{ width: 240 }} />
        </div>
        <table className="pricing-table">
          <thead>
            <tr><th>Shop</th><th style={{ textAlign: 'right' }}>Scans (30d)</th><th style={{ textAlign: 'right' }}>Revenue</th><th>Status</th><th /></tr>
          </thead>
          <tbody>
            {active.map((s, i) =>
            <tr key={i}>
                <td>{s.name}</td>
                <td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>{s.scans}</td>
                <td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>{s.rev}</td>
                <td>{s.flag ? <Chip>● {s.flag}</Chip> : <Chip variant="green">● active</Chip>}</td>
                <td className="mono mut">→</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>);

}

/* ---------- Heatmap tab ---------- */
function AdminHeatmap() {
  const cells = Array.from({ length: 100 }, (_, i) => {
    // Cluster density near center
    const x = i % 10,y = Math.floor(i / 10);
    const dx = x - 5,dy = y - 5;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const v = Math.max(0, 1 - dist / 6) * (0.5 + Math.sin(i * 1.7) * 0.3);
    return Math.max(0, Math.min(1, v));
  });
  return (
    <>
      <Card>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <MiniLabel>DENSITY · LAST 30 DAYS</MiniLabel>
            <h3>Chiang Mai scan heatmap — <span style={{ color: 'var(--green-ink)' }}>10×10 grid</span></h3>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <Chip>30d ▾</Chip>
            <Chip>all materials ▾</Chip>
          </div>
        </div>

        <div className="row" style={{ gap: 18, alignItems: 'flex-start' }}>
          <div className="heatmap">
            {cells.map((v, i) =>
            <span key={i} className="c" style={{
              background: `rgba(34,197,94,${0.1 + v * 0.7})`,
              borderColor: v > 0.7 ? 'var(--green-ink)' : 'var(--ink-4)'
            }} />
            )}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <MiniLabel>Top districts</MiniLabel>
              {[
              ['Nimman / Suthep', '34%', 248],
              ['Old City', '21%', 156],
              ['San Sai', '14%', 98],
              ['Mae Rim', '11%', 77],
              ['Doi Saket', '8%', 54]].
              map((r, i) =>
              <div key={i} className="row" style={{ padding: '8px 0', borderBottom: '1.5px dashed var(--ink-4)' }}>
                  <span style={{ flex: 1, fontFamily: 'var(--label)', fontSize: 16 }}>{r[0]}</span>
                  <span className="mono" style={{ fontWeight: 600, color: 'var(--green-ink)', minWidth: 50, textAlign: 'right' }}>{r[1]}</span>
                  <span className="mono mut" style={{ minWidth: 50, textAlign: 'right' }}>{r[2]} scans</span>
                </div>
              )}
            </div>
            <div className="mono mut">Color intensity = scan density. Hover for raw count + materials breakdown.</div>
          </div>
        </div>
      </Card>
    </>);

}

/* ---------- AI Config tab ---------- */
function AdminAiConfig() {
  return (
    <>
      <Card>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <MiniLabel>SECOND BRAIN · CLOUD INFERENCE</MiniLabel>
            <h3>Vision model configuration</h3>
          </div>
          <Chip variant="soft">saved to localStorage</Chip>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input label="Provider" value="OpenRouter · anthropic/claude-3.5-sonnet" icon />
          <Input label="API key" value="sk-or-•••••••••••••••••a4f9" icon />
          <Input label="System prompt" placeholder="Classify the recyclable in the image..." icon />
          <Input label="Confidence threshold" value="0.72" icon />
        </div>

        <SectionDivider label="test panel" />
        <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 160, height: 160, border: '1.5px dashed var(--ink-4)', borderRadius: 8,
            background: 'repeating-linear-gradient(135deg, rgba(0,0,0,.04) 0 1px, transparent 1px 8px)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)'
          }}>drop test image</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button variant="primary">▶ Run classification</Button>
            <Card style={{ padding: 12, boxShadow: 'none', background: 'var(--paper-2)' }}>
              <div className="mono mut">last result · 47ms</div>
              <div style={{ fontFamily: 'var(--label)', fontSize: 18 }}>
                <b>PET bottle (clear)</b> · conf 0.94 · grade A · contam 11%
              </div>
              <div className="mono">tokens: 1,240 in · 86 out · cost ฿0.012</div>
            </Card>
          </div>
        </div>
      </Card>
    </>);

}

/* ---------- AI Studio tab (C-07) ---------- */
function ClassUploadCard({ name, samples, filled = 0 }) {
  return (
    <div className="classcard">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--label)', fontSize: 16, fontWeight: 600 }}>{name}</span>
        <span className="mono mut">{filled}/{samples} samples</span>
      </div>
      <div className="imgs">
        {Array.from({ length: 4 }).map((_, i) =>
        <div key={i} className={'ph ' + (i < filled ? 'filled' : '')}>
            {i < filled ? '✓' : '+'}
          </div>
        )}
      </div>
    </div>);

}

function AdminAiStudio() {
  const classes = [
  { name: 'PET bottle', samples: 50, filled: 4 },
  { name: 'HDPE', samples: 50, filled: 3 },
  { name: 'Cardboard', samples: 50, filled: 4 },
  { name: 'Office paper', samples: 50, filled: 2 },
  { name: 'Aluminium can', samples: 50, filled: 4 },
  { name: 'Mixed ferrous', samples: 50, filled: 1 },
  { name: 'Clear glass', samples: 50, filled: 3 },
  { name: 'Mixed waste', samples: 50, filled: 2 }];

  return (
    <>
      <Card>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <MiniLabel>STAGE 1 · ON-DEVICE ONNX</MiniLabel>
            <h3>Train a custom classifier — <span style={{ color: 'var(--green-ink)' }}>8 classes</span></h3>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Chip variant="soft">version v2.1 · deployed</Chip>
            <Button variant="primary">▶ Train Model</Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {classes.map((c) => <ClassUploadCard key={c.name} {...c} />)}
        </div>

        <SectionDivider label="training progress" />
        <div className="row" style={{ gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="mono">epoch 14 / 30 · loss 0.082 · val acc 0.94</span>
              <span className="mono" style={{ color: 'var(--green-ink)' }}>● running · 2m 14s</span>
            </div>
            <div className="progress"><i style={{ width: '47%' }} /></div>
          </div>
          <Button variant="secondary">Deploy → v2.2</Button>
        </div>
      </Card>
    </>);

}

/* ---------- Moderation tab ---------- */
function AdminModeration() {
  const posts = [
  { id: '#P-882', author: 'Anan W.', title: '500kg cardboard — pickup tomorrow', grade: 'B', flag: 'auto · spam?', when: '2h ago' },
  { id: '#P-879', author: 'JJ #14', title: 'WTB aluminium any grade', grade: 'A', flag: 'user-reported · 3', when: 'yesterday' },
  { id: '#P-877', author: 'Café Linh', title: 'Restaurant scrap monthly contract', grade: 'B', flag: null, when: '2 days' },
  { id: '#P-873', author: 'Tao M.', title: 'PET stockpile 200kg @ ฿22/kg', grade: 'A', flag: null, when: '3 days' }];

  return (
    <>
      <Card>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <MiniLabel>MARKETPLACE QUEUE · 2 FLAGGED</MiniLabel>
            <h3>Posts requiring review</h3>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Chip>filter: flagged only ▾</Chip>
            <Chip>sort: newest ▾</Chip>
          </div>
        </div>

        <table className="pricing-table">
          <thead>
            <tr><th>Post</th><th>Author</th><th>Grade</th><th>Flag</th><th>When</th><th /></tr>
          </thead>
          <tbody>
            {posts.map((p, i) =>
            <tr key={i}>
                <td><span style={{ fontWeight: 600 }}>{p.title}</span> <span className="mono mut" style={{ fontSize: 11 }}>{p.id}</span></td>
                <td className="mono" style={{ fontSize: 13 }}>{p.author}</td>
                <td><GradeTag grade={p.grade} /></td>
                <td>{p.flag ? <Chip>● {p.flag}</Chip> : <span className="mono mut">—</span>}</td>
                <td className="mono mut" style={{ fontSize: 12 }}>{p.when}</td>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    <Button variant="secondary" style={{ height: 28, fontSize: 13, padding: '0 10px' }}>
                      {p.flag ? 'Unflag' : 'Flag'}
                    </Button>
                    <Button variant="ghost" style={{ height: 28, fontSize: 13, padding: '0 8px', color: '#b94a3a' }}>Remove</Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>);

}

/* ---------- AdminPage shell ---------- */
function AdminPage() {
  const [tab, setTab] = React.useState('shops');
  return (
    <div className="ab admin wf">
      <AdminTopbar />
      <AdminSidebar active={tab} onSelect={setTab} />
      <main className="main">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="crumbs">/x/admin / {tab.toUpperCase()}</div>
            <h1>{
              { shops: 'Shop management', heatmap: 'Geographic activity',
                'ai-config': 'AI model configuration', 'ai-studio': 'AI Studio · custom training',
                moderation: 'Marketplace moderation' }[tab]
              }</h1>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Chip variant="soft">env: production</Chip>
            <Button variant="secondary">↻ Refresh</Button>
          </div>
        </div>

        {tab === 'shops' && <AdminShops />}
        {tab === 'heatmap' && <AdminHeatmap />}
        {tab === 'ai-config' && <AdminAiConfig />}
        {tab === 'ai-studio' && <AdminAiStudio />}
        {tab === 'moderation' && <AdminModeration />}
      </main>
    </div>);

}

Object.assign(window, { AdminPage });