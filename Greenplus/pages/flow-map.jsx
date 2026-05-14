/* =========================================================
   FLOW DIAGRAM — Visual map of the user/buyer/admin flows
   ========================================================= */

const { Chip, MiniLabel } = window;

function FlowNode({ path, role, title, bullets, color }) {
  return (
    <div className="flow-node" style={color ? { borderColor: color, background: `color-mix(in oklab, ${color} 8%, var(--paper))` } : null}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="path">{path}</span>
        <span className="role">{role}</span>
      </div>
      <h4>{title}</h4>
      <ul>
        {bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    </div>
  );
}

function FlowMap() {
  return (
    <div className="ab flow wf">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <MiniLabel>SITEMAP · USER JOURNEY · v0.4</MiniLabel>
          <h1>How everything fits together</h1>
          <p className="mono mut">Color = role · arrows shown in the doc, not drawn here</p>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <Chip variant="soft">user</Chip>
          <Chip>buyer</Chip>
          <span className="chip" style={{ background: '#1a1a1a', color: '#fafaf7', borderColor: '#1a1a1a' }}>admin</span>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <MiniLabel>0 · Entry</MiniLabel>
        <div className="flow-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          <FlowNode path="/" role="public" title="LandingPage"
            bullets={['Role chooser: user / buyer','Auto-redirect if session exists','Hero + stats + CTA']} />
          <FlowNode path="/login" role="public" title="LoginPage"
            bullets={['Email + Google + LINE','useAuth hook · supabase','→ ROLE_DEST[role]']} />
          <FlowNode path="/x/admin" role="admin" title="AdminLoginPage"
            bullets={['Hidden, no nav link','Auto-signout if role ≠ admin','2FA required']} color="#1a1a1a" />
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <MiniLabel>1 · User flow (mobile)</MiniLabel>
        <div className="flow-grid">
          <FlowNode path="/home" role="user" title="HomePage"
            bullets={['KPIs + recent scans','Quick CTAs','Buyer alerts banner']} color="var(--green-ink)" />
          <FlowNode path="/scan" role="user" title="ScanPage"
            bullets={['Stage 1 detect → stage 2 grade','twoStageInfer() · onnx','addToBasket + insertScan']} color="var(--green-ink)" />
          <FlowNode path="/basket" role="user" title="BasketPage"
            bullets={['Items + skip/remove','useGPS → haversine','Single vs Multi-stop route']} color="var(--green-ink)" />
          <FlowNode path="/map" role="user" title="MapPage"
            bullets={['Leaflet + OSM tiles','SHOPS markers + popup','Get Directions ext link']} color="var(--green-ink)" />
          <FlowNode path="/marketplace" role="user+buyer" title="MarketplacePage"
            bullets={['Grade A/B/C filter','PostAd modal (both roles)','Contact buyer']} color="var(--green-ink)" />
          <FlowNode path="/eco-points" role="user" title="EcoPointsPage"
            bullets={['Tier progress + history','Source: eco_points table','tier multiplier ×1.0–1.2']} color="var(--green-ink)" />
          <FlowNode path="/profile" role="all" title="ProfilePage"
            bullets={['Avatar + lifetime stats','Scan history','Settings · sign out']} color="var(--green-ink)" />
          <FlowNode path="/settings" role="all" title="SettingsPage"
            bullets={['Dark mode toggle','Language (TH/EN)','Account export · delete']} color="var(--green-ink)" />
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <MiniLabel>2 · Buyer flow (desktop sidebar)</MiniLabel>
        <div className="flow-grid">
          <FlowNode path="/dashboard" role="buyer" title="DashboardPage"
            bullets={['Pending / accepted / done KPIs','Bookings list · accept/reject','Pricing table editor']} color="var(--ink)" />
          <FlowNode path="/marketplace" role="buyer" title="MarketplacePage"
            bullets={['Same component as user','PostAd available','Filter + sort']} color="var(--ink)" />
          <FlowNode path="/profile" role="buyer" title="ProfilePage (buyer)"
            bullets={['shopInfo · acceptedMaterials','pricingTable summary','License + verification']} color="var(--ink)" />
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <MiniLabel>3 · Admin console</MiniLabel>
        <div className="flow-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
          <FlowNode path="/admin · Shops" role="admin" title="Shop approval"
            bullets={['Pending list · 4','Active shops + stats','Docs verification']} color="#1a1a1a" />
          <FlowNode path="/admin · Heatmap" role="admin" title="Density grid"
            bullets={['10×10 Chiang Mai grid','Top 5 districts','30d / 7d filter']} color="#1a1a1a" />
          <FlowNode path="/admin · AI Config" role="admin" title="Vision model"
            bullets={['Provider + key','Threshold + sys prompt','Test panel + cost']} color="#1a1a1a" />
          <FlowNode path="/admin · AI Studio" role="admin" title="Train custom (C-07)"
            bullets={['8 classes · upload','Progress bar','Deploy ONNX v2.x']} color="#1a1a1a" />
          <FlowNode path="/admin · Moderation" role="admin" title="Marketplace posts"
            bullets={['Flag · unflag','Remove post','Auto + user reports']} color="#1a1a1a" />
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <MiniLabel>State → page map</MiniLabel>
        <div className="flow-node" style={{ minHeight: 0 }}>
          <table className="pricing-table" style={{ marginTop: 0 }}>
            <thead>
              <tr><th>slice</th><th>reads</th><th>writes</th></tr>
            </thead>
            <tbody>
              <tr><td>user</td><td className="mono" style={{ fontSize: 12 }}>every page</td><td className="mono" style={{ fontSize: 12 }}>Login · AdminLogin · Settings</td></tr>
              <tr><td>waste.basket</td><td className="mono" style={{ fontSize: 12 }}>Home · Basket</td><td className="mono" style={{ fontSize: 12 }}>Scan (addToBasket)</td></tr>
              <tr><td>waste.lastScan</td><td className="mono" style={{ fontSize: 12 }}>Home</td><td className="mono" style={{ fontSize: 12 }}>Scan (setLastScan)</td></tr>
              <tr><td>marketplace</td><td className="mono" style={{ fontSize: 12 }}>Marketplace · Admin</td><td className="mono" style={{ fontSize: 12 }}>Marketplace (addPost) · Admin (flag/remove)</td></tr>
              <tr><td>bookings</td><td className="mono" style={{ fontSize: 12 }}>Dashboard · Basket</td><td className="mono" style={{ fontSize: 12 }}>Basket (addBooking) · Dashboard (updateStatus)</td></tr>
              <tr><td>aiConfig</td><td className="mono" style={{ fontSize: 12 }}>Scan · Admin</td><td className="mono" style={{ fontSize: 12 }}>Admin (setAiConfig)</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FlowMap });
