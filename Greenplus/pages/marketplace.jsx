/* =========================================================
   MARKETPLACE — listings feed (mobile) + Post Ad modal
   The buyer-feed under desktop/mobile.jsx is a P2P request list.
   THIS file is the public "I have N kg for sale" feed.
   ========================================================= */

const {
  PhoneFrame, StatusBar, MHead, MTabbar,
  Button, Card, Chip, GradeTag, MiniLabel, Input, SectionDivider, Avatar,
} = window;

const LISTINGS = [
  { id: 882, name: 'เฮียอ้วน',       loc: 'San Sai',    dist: '1.2km', mat: 'Aluminium cans',      kg: 50, grade: 'A', price: 48,  hint: 'mkt 62', when: '2h ago' },
  { id: 879, name: 'Anan W.',         loc: 'Suthep',     dist: '2.0km', mat: 'PET (clear)',         kg: 20, grade: 'A', price: 22,  hint: 'mkt 24', when: '5h ago' },
  { id: 877, name: 'Café Linh',       loc: 'Nimman',     dist: '3.0km', mat: 'Cardboard',           kg: 80, grade: 'B', price: 4,   hint: 'mkt 4.1', when: 'yest.' },
  { id: 873, name: 'Praew K.',        loc: 'Mae Rim',    dist: '6.4km', mat: 'Office paper',        kg: 15, grade: 'A', price: 7,   hint: 'mkt 7.2', when: '2 days' },
  { id: 869, name: 'Doi Saket Co.',   loc: 'Doi Saket',  dist: '8.7km', mat: 'Mixed ferrous',       kg: 40, grade: 'B', price: 9,   hint: 'mkt 9.8', when: '3 days' },
];

function ListingCard({ row, role = 'user' }) {
  return (
    <div className="m-listcard">
      <div className="h">
        <GradeTag grade={row.grade} />
        <div style={{ flex: 1 }}>
          <div className="nm">{row.mat}</div>
          <div className="meta">{row.kg} kg · {row.name} · {row.dist}</div>
        </div>
        <Chip variant="soft">{row.when}</Chip>
      </div>

      <div className="row" style={{ justifyContent: 'space-between', padding: '4px 0', borderTop: '1.5px dashed var(--ink-4)', marginTop: 4 }}>
        <div>
          <div className="mono mut" style={{ fontSize: 10 }}>asking</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700 }}>฿ {row.price}/kg</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono mut" style={{ fontSize: 10 }}>market</div>
          <div className="mono" style={{ fontSize: 13, color: 'var(--green-ink)' }}>฿ {row.hint}</div>
        </div>
        <Button variant="primary" style={{ height: 32, fontSize: 14, padding: '0 14px' }}>
          {role === 'buyer' ? 'Make offer →' : 'Contact'}
        </Button>
      </div>
    </div>
  );
}

function MobileMarketplace({ role = 'user' }) {
  const [filter, setFilter] = React.useState('all');
  const filtered = filter === 'all' ? LISTINGS : LISTINGS.filter(r => r.grade.toLowerCase() === filter);
  return (
    <PhoneFrame>
      <StatusBar />
      <MHead showIp={false} />
      <div className="m-body">
        <div>
          <MiniLabel>CHIANG MAI · TODAY</MiniLabel>
          <h1>Marketplace <span style={{ color: 'var(--green-ink)', fontFamily: 'var(--label)', fontSize: 22 }}>· {filtered.length} listings</span></h1>
        </div>

        <div className="m-seg">
          {[['all','All'],['a','Grade A'],['b','Grade B'],['c','Grade C']].map(([id, label]) => (
            <span key={id} className={'s ' + (filter === id ? 'on' : '')} onClick={() => setFilter(id)}>{label}</span>
          ))}
        </div>

        <div className="col" style={{ gap: 10 }}>
          {filtered.map(r => <ListingCard key={r.id} row={r} role={role} />)}
        </div>
      </div>

      {/* Sticky FAB */}
      <Button variant="primary"
              style={{
                position: 'absolute', left: 16, right: 16, bottom: 84,
                height: 48, fontSize: 18,
                boxShadow: '3px 3px 0 var(--shadow)',
              }}>
        + Post a listing
      </Button>

      <MTabbar active="market" />
    </PhoneFrame>
  );
}

/* ---------- Post Ad modal — shown as standalone artboard ---------- */
function PostAdModal() {
  return (
    <div className="wf" style={{
      width: '100%', height: '100%',
      background: 'rgba(0,0,0,.55)',
      display: 'grid', placeItems: 'center',
      padding: 30,
    }}>
      <div style={{
        width: 400, maxWidth: '100%',
        background: 'var(--paper)',
        border: '1.5px solid var(--line)', borderRadius: 14,
        boxShadow: '4px 4px 0 var(--shadow)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div className="row" style={{
          padding: '14px 18px', borderBottom: '1.5px solid var(--line)',
          background: 'var(--paper-2)',
          justifyContent: 'space-between',
        }}>
          <div>
            <MiniLabel>NEW LISTING</MiniLabel>
            <div style={{ fontFamily: 'var(--hand)', fontSize: 22, fontWeight: 700 }}>Post a listing</div>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink-3)', cursor: 'pointer' }}>×</span>
        </div>

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Material" value="PET (clear plastic)" icon />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Input label="Weight (kg)"     placeholder="20"   icon />
            <Input label="Asking ฿ / kg"   placeholder="22"   icon />
          </div>

          <div>
            <MiniLabel>Grade</MiniLabel>
            <div className="row" style={{ gap: 8, marginTop: 6 }}>
              {['A','B','C'].map(g => (
                <label key={g} style={{
                  flex: 1, padding: '10px 8px',
                  border: '1.5px solid var(--line)',
                  background: g === 'A' ? 'var(--green-soft)' : 'var(--paper)',
                  borderColor: g === 'A' ? 'var(--green-ink)' : 'var(--line)',
                  borderRadius: 6,
                  display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer',
                }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '1.5px solid var(--line)',
                    background: g === 'A' ? 'var(--green)' : 'transparent',
                  }} />
                  <GradeTag grade={g} />
                </label>
              ))}
            </div>
          </div>

          <Input label="Shop / name"  value="Anan W."         icon />
          <Input label="Contact"      placeholder="LINE id"   icon />

          <div style={{
            background: 'var(--green-soft)', border: '1.5px solid var(--green-ink)',
            borderRadius: 8, padding: 10,
            display: 'flex', gap: 10,
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'var(--green)', border: '1.5px solid var(--green-ink)',
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--hand)', fontSize: 14, color: '#062',
            }}>?</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--hand)', fontSize: 15, color: 'var(--green-ink)' }}>Suggested ฿24/kg</div>
              <div className="mono mut" style={{ color: 'var(--ink-2)', fontSize: 11 }}>Based on 6 buyers in Chiang Mai · last 24h</div>
            </div>
          </div>

          <div className="row" style={{ gap: 10, marginTop: 4 }}>
            <Button variant="ghost"   style={{ flex: 1 }}>Cancel</Button>
            <Button variant="primary" style={{ flex: 2 }}>Post listing →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MobileMarketplace, PostAdModal, ListingCard, LISTINGS });
