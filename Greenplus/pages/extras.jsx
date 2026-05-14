/* =========================================================
   EXTRAS — pieces not in the original wireframes:
     · Empty states (basket, scans, bookings)
     · Loading skeletons
     · Error pages (404, network)
     · Notification drawer
     · Onboarding overlay
   ========================================================= */

const {
  PhoneFrame, StatusBar, MHead, MTabbar,
  LogoMark, LogoWordmark,
  Button, Card, Chip, GradeTag, MiniLabel, Avatar, SectionDivider
} = window;

/* ---------- Empty states ---------- */
function EmptyState({ icon = '◯', title, body, primaryCta, secondaryCta }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 14, padding: '40px 20px', textAlign: 'center'
    }}>
      <div style={{
        width: 84, height: 84, borderRadius: 18,
        border: '2px dashed var(--ink-4)',
        display: 'grid', placeItems: 'center',
        fontFamily: 'var(--hand)', fontSize: 38, color: 'var(--ink-3)',
        background: 'var(--paper-2)'
      }}>{icon}</div>
      <div style={{ fontFamily: 'var(--hand)', fontSize: 24, fontWeight: 700 }}>{title}</div>
      <p style={{ margin: 0, fontFamily: 'var(--label)', fontSize: 16, color: 'var(--ink-2)', maxWidth: 280, lineHeight: 1.3 }}>{body}</p>
      {primaryCta && <Button variant="primary" style={{ marginTop: 6 }}>{primaryCta}</Button>}
      {secondaryCta && <Button variant="ghost">{secondaryCta}</Button>}
    </div>);

}

function EmptyBasket() {
  return (
    <PhoneFrame>
      <StatusBar />
      <MHead showIp={false} />
      <div className="m-body" style={{ justifyContent: 'center' }}>
        <EmptyState
          icon="🧺"
          title="Your basket is empty"
          body="Scan an item to add it. The AI will weigh, grade and price it in 2 seconds."
          primaryCta="+ Scan an item"
          secondaryCta="See today's prices →" />
        
        <SectionDivider label="suggested" />
        <div className="m-card" style={{ padding: '8px 14px' }}>
          {[
          ['PET bottles', 'fastest payout', '฿24/kg'],
          ['Aluminium cans', 'highest value', '฿62/kg'],
          ['Cardboard', 'easy to bundle', '฿4/kg']].
          map((r, i) =>
          <div key={i} className="m-row">
              <div style={{ width: 32, height: 32, border: '1.5px dashed var(--ink-4)', borderRadius: 6, background: 'var(--paper-2)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--label)', fontSize: 16 }}>{r[0]}</div>
                <div className="mono">{r[1]}</div>
              </div>
              <span className="mono" style={{ color: 'var(--green-ink)', fontWeight: 600 }}>{r[2]}</span>
            </div>
          )}
        </div>
      </div>
      <MTabbar active="home" />
    </PhoneFrame>);

}

function EmptyScans() {
  return (
    <PhoneFrame>
      <StatusBar />
      <MHead showIp={false} />
      <div className="m-body" style={{ justifyContent: 'center' }}>
        <EmptyState
          icon="📷"
          title="No scans yet"
          body="Point the camera at any recyclable to get started. Your history will live here."
          primaryCta="Start your first scan →" />
        
      </div>
      <MTabbar active="me" />
    </PhoneFrame>);

}

function EmptyBookings() {
  return (
    <div className="ab bdash wf">
      <header className="topbar">
        <LogoMark size={28} />
        <LogoWordmark size={20} />
        <span className="mono mut" style={{ marginLeft: 12 }}>/ DASHBOARD</span>
      </header>
      <aside className="sidebar">
        <div className="brand" style={{ padding: '4px 6px 12px', borderBottom: '1.5px dashed var(--ink-4)', marginBottom: 6 }}>
          <LogoMark size={32} />
          <LogoWordmark size={22} />
        </div>
        <div className="nav-h">BUYER</div>
        {['Dashboard', 'Marketplace', 'Pricing', 'Profile'].map((n) =>
        <div key={n} className={'nav-item ' + (n === 'Dashboard' ? 'active' : '')}>
            <span className="ic" /><span>{n}</span>
          </div>
        )}
      </aside>
      <main className="main">
        <div className="crumbs">HOME / DASHBOARD</div>
        <h1>Somchai Scrap — <span style={{ color: 'var(--green-ink)' }}>quiet day</span></h1>

        <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <EmptyState
            icon="📋"
            title="No bookings yet today"
            body="When a recycler books a pickup, it'll appear here. You can accept or reject in one tap."
            primaryCta="Adjust today's prices →"
            secondaryCta="View past bookings" />
          
        </Card>
      </main>
    </div>);

}

/* ---------- Loading skeleton ---------- */
function Skel({ w = '100%', h = 12, r = 4, style }) {
  return (
    <span style={{
      display: 'inline-block', width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, var(--paper-2) 0%, var(--ink-4) 50%, var(--paper-2) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s ease-in-out infinite',
      ...style
    }} />);

}

function LoadingSkeletons() {
  return (
    <PhoneFrame>
      <StatusBar />
      <MHead showIp={false} />
      <div className="m-body">
        <style>{`
          @keyframes shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>

        <div className="row" style={{ gap: 10 }}>
          <Skel w={140} h={12} />
          <Skel w={60} h={10} style={{ marginLeft: 'auto' }} />
        </div>
        <Skel w="80%" h={30} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[1, 2].map((i) =>
          <div key={i} className="m-card">
              <Skel w={80} h={10} />
              <Skel w={120} h={22} />
              <Skel w={100} h={10} />
            </div>
          )}
        </div>

        <div className="m-card">
          <Skel w={140} h={14} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, height: 80, alignItems: 'end' }}>
            {[30, 50, 38, 70, 45, 90, 55].map((h, i) => <Skel key={i} h={h} r={2} />)}
          </div>
        </div>

        {[1, 2, 3].map((i) =>
        <div key={i} className="m-card" style={{ padding: '12px 14px' }}>
            <div className="row" style={{ gap: 10 }}>
              <Skel w={32} h={32} r={6} />
              <div style={{ flex: 1 }}>
                <Skel w="60%" h={14} />
                <Skel w="40%" h={10} style={{ marginTop: 4 }} />
              </div>
              <Skel w={40} h={12} />
            </div>
          </div>
        )}
      </div>
      <MTabbar active="home" />
    </PhoneFrame>);

}

/* ---------- 404 Page ---------- */
function Page404() {
  return (
    <PhoneFrame>
      <StatusBar />
      <MHead showIp={false} />
      <div className="m-body" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          fontFamily: 'var(--hand)', fontSize: 120, fontWeight: 700, lineHeight: 1,
          color: 'var(--green-ink)', letterSpacing: '-0.04em'
        }}>404</div>
        <MiniLabel>ROUTE NOT FOUND</MiniLabel>
        <div style={{ fontFamily: 'var(--hand)', fontSize: 26, textAlign: 'center', marginTop: 4 }}>
          We checked the map — this trail leads nowhere.
        </div>
        <p style={{ margin: 0, fontFamily: 'var(--label)', fontSize: 16, color: 'var(--ink-2)', maxWidth: 280, textAlign: 'center' }}>
          The page you wanted was either moved or never existed. Try one of these instead.
        </p>
        <div className="col" style={{ gap: 8, width: '100%', marginTop: 16 }}>
          <Button variant="primary" fullWidth>← Back to Home</Button>
          <Button variant="ghost" fullWidth>Search the app</Button>
        </div>
        <div className="mono mut" style={{ marginTop: 'auto' }}>
          requested · /scan/8a91 · ref #404-22b
        </div>
      </div>
      <MTabbar active="home" />
    </PhoneFrame>);

}

/* ---------- Network error ---------- */
function PageNetworkError() {
  return (
    <PhoneFrame>
      <StatusBar />
      <MHead showIp={false} />
      <div className="m-body" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: 96, height: 96, borderRadius: 22,
          border: '2.5px solid #b94a3a',
          background: 'rgba(185,74,58,.08)',
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--hand)', fontSize: 48, color: '#b94a3a'
        }}>!</div>
        <MiniLabel style={{ color: '#b94a3a' }}>CONNECTION LOST</MiniLabel>
        <div style={{ fontFamily: 'var(--hand)', fontSize: 26, textAlign: 'center', marginTop: 4 }}>
          Can't reach GreenPlus servers
        </div>
        <p style={{ margin: 0, fontFamily: 'var(--label)', fontSize: 16, color: 'var(--ink-2)', maxWidth: 280, textAlign: 'center' }}>
          Check your wifi or mobile data. Scans you take now will sync automatically when you're back online.
        </p>

        <div className="m-card" style={{ width: '100%', marginTop: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--label)', fontSize: 15 }}>Offline mode</span>
            <Chip variant="soft">3 queued</Chip>
          </div>
          <div className="mono mut">Stage-1 ONNX still works on-device · prices cached 4 min ago</div>
        </div>

        <Button variant="primary" fullWidth style={{ marginTop: 14 }}>↻ Retry connection</Button>
        <Button variant="ghost" fullWidth>Continue offline</Button>
      </div>
      <MTabbar active="home" />
    </PhoneFrame>);

}

/* ---------- Notification drawer ---------- */
function NotificationDrawer() {
  const notifications = [
  { type: 'price', title: 'PET prices up 12%', body: 'Lung Somchai now pays ฿26/kg for grade A · 1.2km away', when: '5m', new: true },
  { type: 'booking', title: 'Booking confirmed', body: 'Multi-stop loop · ฿78 · pickup 14:00 today', when: '1h', new: true },
  { type: 'eco', title: 'You hit Gold tier ✨', body: 'New multiplier ×1.1 active on every scan', when: '3h', new: false },
  { type: 'price', title: 'Aluminium spike', body: '+12.7% in your area · consider listing your stock', when: '6h', new: false },
  { type: 'system', title: 'Weekly summary', body: '12.4 kg recycled · ฿286 earned · 91 kg CO₂', when: 'Mon', new: false }];

  const tint = {
    price: { ic: '฿', bg: 'var(--green-soft)', fg: 'var(--green-ink)' },
    booking: { ic: '✓', bg: 'rgba(34,197,94,.18)', fg: 'var(--green-ink)' },
    eco: { ic: '★', bg: '#fff3a8', fg: '#5a4a1a' },
    system: { ic: '◐', bg: 'var(--paper-2)', fg: 'var(--ink-2)' }
  };
  return (
    <PhoneFrame>
      <StatusBar />
      {/* faded base page in the back */}
      <div className="m-head" style={{ opacity: .3 }}>
        <div className="brand"><LogoMark size={28} /><LogoWordmark size={20} /></div>
        <div className="avatar">A</div>
      </div>
      <div className="m-body" style={{ opacity: .25, pointerEvents: 'none', flex: 1 }}>
        <div className="mono">MORNING, ANAN</div>
        <h1>Good haul this week — <span style={{ color: 'var(--green-ink)' }}>12.4 kg</span></h1>
        <div style={{ height: 80, background: 'var(--paper-2)', borderRadius: 8 }} />
      </div>

      {/* drawer */}
      <div style={{
        position: 'absolute', left: 18, right: 18, top: 68, bottom: 80,
        background: 'var(--paper)',
        border: '1.5px solid var(--line)', borderRadius: 14,
        boxShadow: '4px 4px 0 var(--shadow)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div className="row" style={{
          padding: '14px 16px', borderBottom: '1.5px solid var(--line)',
          justifyContent: 'space-between', background: 'var(--paper-2)'
        }}>
          <div>
            <MiniLabel>NOTIFICATIONS</MiniLabel>
            <div style={{ fontFamily: 'var(--hand)', fontSize: 22, fontWeight: 700 }}>You have 2 new</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--green-ink)' }}>mark all read</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink-3)' }}>×</span>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {notifications.map((n, i) => {
            const t = tint[n.type];
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '36px 1fr auto',
                gap: 10, padding: '12px 16px',
                borderBottom: '1.5px dashed var(--ink-4)',
                background: n.new ? 'var(--green-soft)' : 'transparent'
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  border: '1.5px solid var(--line)', background: t.bg, color: t.fg,
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--hand)', fontSize: 18
                }}>{t.ic}</div>
                <div>
                  <div className="row">
                    <span style={{ fontFamily: 'var(--label)', fontSize: 16, fontWeight: 600 }}>{n.title}</span>
                    {n.new && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-ink)', marginLeft: 6 }} />}
                  </div>
                  <div className="mono mut" style={{ fontSize: 11 }}>{n.body}</div>
                </div>
                <span className="mono mut" style={{ fontSize: 10 }}>{n.when}</span>
              </div>);

          })}
        </div>

        <div className="row" style={{ padding: 12, borderTop: '1.5px solid var(--line)', background: 'var(--paper-2)' }}>
          <span className="mono mut">5 in last 7 days</span>
          <Button variant="ghost" style={{ marginLeft: 'auto', height: 30, fontSize: 14 }}>Settings →</Button>
        </div>
      </div>

      <MTabbar active="home" />
    </PhoneFrame>);

}

/* ---------- Onboarding overlay (first scan tutorial) ---------- */
function OnboardingOverlay() {
  return (
    <PhoneFrame>
      <StatusBar />
      {/* underneath: the scanner page */}
      <div className="m-body" style={{ padding: '10px 12px 0', gap: 10, opacity: .35, pointerEvents: 'none' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="mono">← back</span>
          <span className="mono">camera 1 · flash auto</span>
        </div>
        <div className="m-scan-stage">
          <span className="vf-corner tl" /><span className="vf-corner tr" />
          <span className="vf-corner bl" /><span className="vf-corner br" />
          <div className="object">
            <div className="bbox"><i /><b /><span className="label">PET · 98%</span></div>
            <div className="bottle" />
          </div>
        </div>
      </div>

      {/* dim overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', pointerEvents: 'none' }} />

      {/* spotlight ring on the viewfinder */}
      <div style={{
        position: 'absolute', left: 36, right: 36, top: 130, height: 380,
        border: '3px dashed var(--green)',
        borderRadius: 18,
        boxShadow: '0 0 0 9999px rgba(0,0,0,.45)',
        animation: 'pulseRing 1.6s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      <style>{`
        @keyframes pulseRing { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.02);} }
      `}</style>

      {/* tooltip card */}
      <div style={{
        position: 'absolute', left: 18, right: 18, bottom: 100,
        background: 'var(--paper)',
        border: '1.5px solid var(--line)', borderRadius: 14,
        boxShadow: '3px 3px 0 var(--shadow)',
        padding: 16, display: 'flex', flexDirection: 'column', gap: 8
      }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <Chip variant="soft">step 1 of 3</Chip>
          <span className="mono mut" style={{ fontSize: 11 }}>skip ×</span>
        </div>
        <div style={{ fontFamily: 'var(--hand)', fontSize: 22, fontWeight: 700, color: 'var(--green-ink)' }}>
          Point at any item
        </div>
        <p style={{ margin: 0, fontFamily: 'var(--label)', fontSize: 15, color: 'var(--ink-2)' }}>
          Hold steady for ~2 seconds. We'll detect the material and grade it automatically.
        </p>
        <div className="row" style={{ gap: 4, marginTop: 4 }}>
          <span style={{ width: 24, height: 4, borderRadius: 2, background: 'var(--green-ink)' }} />
          <span style={{ width: 24, height: 4, borderRadius: 2, background: 'var(--ink-4)' }} />
          <span style={{ width: 24, height: 4, borderRadius: 2, background: 'var(--ink-4)' }} />
          <Button variant="primary" style={{ marginLeft: 'auto', height: 34, fontSize: 15, padding: '0 16px' }}>
            Got it →
          </Button>
        </div>
      </div>
    </PhoneFrame>);

}

Object.assign(window, {
  EmptyBasket, EmptyScans, EmptyBookings,
  LoadingSkeletons, Page404, PageNetworkError,
  NotificationDrawer, OnboardingOverlay,
  Skel, EmptyState
});