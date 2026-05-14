/* =========================================================
   PAGES — Auth flow
   Landing → Login → role-based dest
   AdminLogin (hidden /x/admin)
   ========================================================= */

const {
  LogoMark, LogoWordmark,
  Button, Card, Chip, MiniLabel, Input, SectionDivider,
} = window;

/* ---------- Landing ---------- */
function LandingPage() {
  return (
    <div className="ab landing wf">
      <header className="hero-top">
        <LogoMark size={32} />
        <LogoWordmark size={22} />
        <nav className="links">
          <span>How it works</span>
          <span>Pricing</span>
          <span>For buyers</span>
          <span>EN · TH</span>
        </nav>
      </header>

      <section className="hero">
        <div className="copy">
          <Chip variant="soft">● live · Chiang Mai pilot</Chip>
          <h1>Scan trash. Earn cash.<br />
            <span style={{ color: 'var(--green-ink)' }}>Recycle smarter.</span>
          </h1>
          <p className="lede">
            Point your camera at any recyclable. Our AI grades it, quotes you
            today's market price, and finds the nearest buyer in seconds.
          </p>
          <div className="row" style={{ gap: 12, marginTop: 8 }}>
            <Button variant="primary" style={{ height: 44, fontSize: 19, padding: '0 22px' }}>I have recyclables →</Button>
            <Button variant="secondary" style={{ height: 44, fontSize: 19, padding: '0 22px' }}>I want to buy</Button>
          </div>

          <div className="stats">
            <div className="stat"><div className="n">12,480</div><div className="l">kg recycled</div></div>
            <div className="stat"><div className="n">฿ 286k</div><div className="l">paid out</div></div>
            <div className="stat"><div className="n">340+</div><div className="l">active buyers</div></div>
          </div>
        </div>

        <div className="choose">
          <h2>Pick your side</h2>
          <p className="mono mut">Two roles. Two layouts. Same backend.</p>

          <div className="role-card green">
            <div className="icon">♻</div>
            <div className="meta">
              <h3>I'm a recycler</h3>
              <p>Households, baan-rao, café owners selling their daily scrap.</p>
              <ul>
                <li>scan</li><li>basket</li><li>map</li><li>eco-points</li>
              </ul>
            </div>
            <div className="arr">→</div>
          </div>

          <div className="role-card">
            <div className="icon buyer">฿</div>
            <div className="meta">
              <h3>I'm a buyer / shop</h3>
              <p>Saleng, scrap shops, recycling co-ops setting daily prices.</p>
              <ul>
                <li>bookings</li><li>pricing</li><li>marketplace</li>
              </ul>
            </div>
            <div className="arr">→</div>
          </div>

          <div className="row mono mut" style={{ marginTop: 'auto', justifyContent: 'space-between' }}>
            <span>v0.4 · pre-launch</span>
            <span>support@greenplus.ai</span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Login ---------- */
function LoginPage({ role = 'user' }) {
  const roleColor = role === 'buyer' ? 'var(--ink)' : 'var(--green-ink)';
  return (
    <div className="ab auth wf">
      <div className="auth-top">
        <LogoMark size={28} />
        <LogoWordmark size={20} />
        <span className="badge">role: {role}</span>
      </div>
      <div className="auth-body">
        <div>
          <MiniLabel>SIGN IN</MiniLabel>
          <h2>Welcome back —<br />
            <span style={{ color: roleColor }}>continue as {role}</span>
          </h2>
        </div>

        <div className="oauth">
          <Button variant="secondary" fullWidth style={{ justifyContent: 'flex-start', height: 44 }}>
            <span style={{ width: 18, height: 18, border: '1.5px solid var(--line)', borderRadius: 4, display: 'inline-block', marginRight: 8 }} />
            Continue with Google
          </Button>
          <Button variant="secondary" fullWidth style={{ justifyContent: 'flex-start', height: 44 }}>
            <span style={{ width: 18, height: 18, border: '1.5px solid var(--line)', borderRadius: 4, display: 'inline-block', marginRight: 8 }} />
            Continue with LINE
          </Button>
        </div>

        <SectionDivider label="or with email" />

        <Input label="Email"    placeholder="you@example.com"  type="email" icon />
        <Input label="Password" placeholder="••••••••"          type="pwd"   icon />

        <div className="row" style={{ justifyContent: 'space-between', marginTop: -4 }}>
          <label className="row mono" style={{ gap: 6, fontSize: 12 }}>
            <span style={{ width: 14, height: 14, border: '1.5px solid var(--line)', borderRadius: 3, background: 'var(--green-soft)' }} />
            Remember me
          </label>
          <span className="mono" style={{ color: 'var(--green-ink)', fontSize: 12 }}>Forgot password?</span>
        </div>

        <Button variant="primary" fullWidth style={{ height: 46, fontSize: 19, marginTop: 6 }}>
          Sign in → {role === 'buyer' ? '/dashboard' : '/home'}
        </Button>

        <div className="mono mut" style={{ textAlign: 'center', marginTop: 'auto' }}>
          No account? <span style={{ color: 'var(--green-ink)' }}>Sign up free</span> · takes 30s
        </div>
      </div>
    </div>
  );
}

/* ---------- Admin Login (hidden /x/admin) ---------- */
function AdminLoginPage() {
  return (
    <div className="ab auth admin-mode wf">
      <div className="auth-top">
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 11, color: '#ff7a7a',
          border: '1.5px solid #ff7a7a', padding: '2px 8px', borderRadius: 99,
        }}>● RESTRICTED</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#8a8880' }}>/x/admin</span>
        <span className="badge" style={{ marginLeft: 'auto', background: '#1f2226', color: '#fafaf7', borderColor: '#3a3d42' }}>internal only</span>
      </div>
      <div className="auth-body">
        <div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.14em', color: '#8a8880' }}>STAFF SIGN-IN</span>
          <h2 style={{ color: '#fafaf7' }}>GreenPlus Admin Console</h2>
        </div>

        <Input label="Email"    placeholder="staff@greenplus.ai"  type="email" icon />
        <Input label="Password" placeholder="••••••••"             type="pwd"   icon />
        <Input label="2FA code" placeholder="6-digit code"         type="otp"   icon />

        <div className="mono mut" style={{ color: '#8a8880', fontSize: 11 }}>
          Auto sign-out if role ≠ admin. All sessions logged for 90 days.
        </div>

        <Button variant="primary" fullWidth style={{ height: 46, fontSize: 19, marginTop: 6 }}>
          Authenticate →
        </Button>

        <div className="row mono mut" style={{ marginTop: 'auto', justifyContent: 'space-between', color: '#8a8880' }}>
          <span>build #428 · 13 May</span>
          <span>← back to public site</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LandingPage, LoginPage, AdminLoginPage });
