/* =========================================================
   APP — Canvas mount
   Sections are ordered by the user-flow doc:
   0 Brand → 1 Flow → 2 Auth → 3 User Mobile → 4 Buyer → 5 Admin
   + the legacy desktop shells for reference.
   ========================================================= */

const {
  // brand
  LogoPrimary, LogoMono, LogoStacked, LogoInverse, LogoNav, LogoAppIcon, LogoClearspace,
  // legacy desktop
  Shell, Scanner, Marketplace,
  // mobile
  MobileHome, MobileScan, MobilePrices, MobileMarket,
  MobileBasket, MobileMap, MobileEcoPoints, MobileProfile, MobileSettings,
  MobileMarketplace, PostAdModal,
  // auth
  LandingPage, LoginPage, AdminLoginPage,
  // buyer + admin
  BuyerDashboard, AdminPage,
  // flow diagram
  FlowMap,
  // extras
  EmptyBasket, EmptyScans, EmptyBookings,
  LoadingSkeletons, Page404, PageNetworkError,
  NotificationDrawer, OnboardingOverlay,
} = window;

function App() {
  return (
    <DesignCanvas
      title="GreenPlus Ai — Wireframes"
      subtitle="Mono-Logic v0 · low-fi · 12-col grid · accent #22c55e">

      <DCSection
        id="brand"
        title="0 — Brand & Logo"
        subtitle="The G+ mark + wordmark. Edit components/logo.jsx → propagates everywhere.">

        <DCArtboard id="logo-primary" label="Primary lockup"    width={520} height={220}><LogoPrimary /></DCArtboard>
        <DCArtboard id="logo-mono"    label="Monogram"          width={260} height={260}><LogoMono /></DCArtboard>
        <DCArtboard id="logo-stacked" label="Stacked"           width={320} height={320}><LogoStacked /></DCArtboard>
        <DCArtboard id="logo-inverse" label="Inverse / on dark" width={520} height={220}><LogoInverse /></DCArtboard>
        <DCArtboard id="logo-nav"     label="Navbar lockup"     width={300} height={80}><LogoNav /></DCArtboard>
        <DCArtboard id="logo-app"     label="App icon · 1024"   width={260} height={260}><LogoAppIcon /></DCArtboard>
        <DCArtboard id="logo-clear"   label="Clearspace + grid" width={520} height={260}><LogoClearspace /></DCArtboard>
      </DCSection>

      <DCSection
        id="flow"
        title="1 — User flow & sitemap"
        subtitle="The full map of routes, roles, and Redux state. Read this first.">

        <DCArtboard id="flow-ab" label="Flow map" width={1280} height={820}>
          <FlowMap />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="auth"
        title="2 — Auth & onboarding"
        subtitle="Landing → role-based login. /x/admin is hidden & 2FA-gated.">

        <DCArtboard id="auth-landing" label="Landing — role chooser" width={1280} height={820}>
          <LandingPage />
        </DCArtboard>
        <DCArtboard id="auth-login-user"  label="Login — user"  width={520} height={680}>
          <LoginPage role="user" />
        </DCArtboard>
        <DCArtboard id="auth-login-buyer" label="Login — buyer" width={520} height={680}>
          <LoginPage role="buyer" />
        </DCArtboard>
        <DCArtboard id="auth-admin"  label="AdminLogin · /x/admin" width={520} height={680}>
          <AdminLoginPage />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="user-mobile"
        title="3 — User journey (mobile)"
        subtitle="Thumb-first shell · scan in the center tab · all routes in /home → /profile.">

        <DCArtboard id="m-home"     label="/home"        width={410} height={864}><MobileHome /></DCArtboard>
        <DCArtboard id="m-scan"     label="/scan"        width={410} height={864}><MobileScan /></DCArtboard>
        <DCArtboard id="m-basket"   label="/basket"      width={410} height={864}><MobileBasket /></DCArtboard>
        <DCArtboard id="m-map"      label="/map"         width={410} height={864}><MobileMap /></DCArtboard>
        <DCArtboard id="m-mkt"      label="/marketplace · listings" width={410} height={864}><MobileMarketplace /></DCArtboard>
        <DCArtboard id="m-postad"   label="Post Ad modal" width={410} height={864}><PostAdModal /></DCArtboard>
        <DCArtboard id="m-market"   label="/marketplace · buy reqs" width={410} height={864}><MobileMarket /></DCArtboard>
        <DCArtboard id="m-prices"   label="prices (mkt)" width={410} height={864}><MobilePrices /></DCArtboard>
        <DCArtboard id="m-eco"      label="/eco-points"  width={410} height={864}><MobileEcoPoints /></DCArtboard>
        <DCArtboard id="m-profile"  label="/profile"     width={410} height={864}><MobileProfile /></DCArtboard>
        <DCArtboard id="m-settings" label="/settings"    width={410} height={864}><MobileSettings /></DCArtboard>
      </DCSection>

      <DCSection
        id="states"
        title="6 — System states & edges"
        subtitle="Empty states · skeletons · 404 · network error · notification drawer · onboarding overlay.">

        <DCArtboard id="ext-empty-basket"  label="Empty · basket"     width={410} height={864}><EmptyBasket /></DCArtboard>
        <DCArtboard id="ext-empty-scans"   label="Empty · scans"      width={410} height={864}><EmptyScans /></DCArtboard>
        <DCArtboard id="ext-skel"          label="Loading skeleton"   width={410} height={864}><LoadingSkeletons /></DCArtboard>
        <DCArtboard id="ext-404"           label="404 · not found"    width={410} height={864}><Page404 /></DCArtboard>
        <DCArtboard id="ext-net"           label="Network error"      width={410} height={864}><PageNetworkError /></DCArtboard>
        <DCArtboard id="ext-notif"         label="Notification drawer" width={410} height={864}><NotificationDrawer /></DCArtboard>
        <DCArtboard id="ext-onb"           label="Onboarding overlay" width={410} height={864}><OnboardingOverlay /></DCArtboard>
        <DCArtboard id="ext-empty-book"    label="Empty · bookings (buyer)" width={1280} height={820}><EmptyBookings /></DCArtboard>
      </DCSection>

      <DCSection
        id="buyer"
        title="4 — Buyer console (desktop)"
        subtitle="Sidebar layout · bookings list + pricing editor.">

        <DCArtboard id="b-dash" label="/dashboard" width={1280} height={820}>
          <BuyerDashboard />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="admin"
        title="5 — Admin console"
        subtitle="5 tabs: Shops · Heatmap · AI Config · AI Studio · Moderation. Click sidebar to switch.">

        <DCArtboard id="admin-ab" label="/admin · Shops" width={1280} height={820}>
          <AdminPage />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="desktop-legacy"
        title="6 — Desktop shells (reference)"
        subtitle="Original full-bleed dashboards · kept for reference until admin/buyer specs are signed off.">

        <DCArtboard id="shell-ab"   label="Dashboard — shell"     width={1280} height={820}><Shell /></DCArtboard>
        <DCArtboard id="scanner-ab" label="AI Scanner — desktop"  width={1280} height={820}><Scanner /></DCArtboard>
        <DCArtboard id="market-ab"  label="Marketplace + pricing" width={1280} height={820}><Marketplace /></DCArtboard>
      </DCSection>

      <DCPostIt x={40} y={40} w={280}>
        <b>How this file is wired</b><br />
        Atoms live in <i>components/atoms.jsx</i> — Button, Card, Chip, GradeTag, KpiCard, etc. Edit once.<br />
        <br />
        Pages live in <i>pages/*.jsx</i> — each one pulls atoms off window.<br />
        <br />
        Logo: <i>components/logo.jsx</i> — used by sidebar, mobile header, brand section.
      </DCPostIt>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
