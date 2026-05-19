import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useT } from '../hooks/useT'
import { useScanHistory } from '../hooks/useScanHistory'
import { useMyShop } from '../hooks/useMyShop'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { WASTE_ITEMS, localName } from '../data/wasteItems'
import { supabase } from '../lib/supabase'
import { clearUser } from '../store/userSlice'

function Avatar({ name }) {
  const initials = (name ?? 'U').slice(0, 2).toUpperCase()
  return (
    <div className="w-16 h-16 bg-[var(--green)] border-[1.5px] border-[var(--ink)] flex items-center justify-center shadow-[2px_2px_0_var(--ink)]">
      <span className="font-brand text-[22px] text-[#062040]">{initials}</span>
    </div>
  )
}

function UserProfile({ profile, session, t, language }) {
  const { scans, loading, totalKg, totalValue } = useScanHistory()

  const emptyMsg = language === 'th'
    ? 'ยังไม่มีการสแกน ชี้กล้องไปที่วัสดุรีไซเคิลเพื่อเริ่มต้น'
    : 'No scans yet. Point your camera at any recyclable item to start.'

  return (
    <>
      <Card className="w-full max-w-2xl flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={profile?.display_name ?? session?.user?.email} />
          <div>
            <p className="font-body text-[17px] text-[var(--ink)] m-0 font-semibold">
              {profile?.display_name ?? session?.user?.email?.split('@')[0]}
            </p>
            <p className="font-data text-[11px] text-[var(--ink-3)] m-0">{session?.user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-[var(--green-soft)] border-[1px] border-[var(--green)] font-data text-[10px] text-[var(--green-ink)] uppercase">
              {t.roleUser}
            </span>
          </div>
        </div>
        {/* Lifetime stats grid */}
        <div className="grid grid-cols-2 border-t-[1.5px] border-[var(--ink-4)] pt-3">
          <div className="flex flex-col gap-0.5 border-r border-[var(--ink-4)] pr-3">
            <span className="font-brand text-[22px] text-[var(--ink)] leading-none">{totalKg.toFixed(1)}</span>
            <span className="font-data text-[9px] text-[var(--ink-3)] uppercase tracking-widest leading-tight">kg recycled</span>
          </div>
          <div className="flex flex-col gap-0.5 pl-3">
            <span className="font-data text-[22px] text-[var(--green)] leading-none">฿{totalValue.toFixed(0)}</span>
            <span className="font-data text-[9px] text-[var(--ink-3)] uppercase tracking-widest leading-tight">earned</span>
          </div>
        </div>
      </Card>

      {/* Scan history */}
      <div className="w-full max-w-2xl flex flex-col gap-2">
        <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.scanHistory}</span>

        {loading && (
          <>
            <div className="h-10 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
            <div className="h-10 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
            <div className="h-10 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
          </>
        )}

        {!loading && scans.length === 0 && (
          <div className="border-[1.5px] border-[var(--ink-4)] p-4">
            <p className="font-data text-[11px] text-[var(--ink-3)] m-0 uppercase tracking-widest">{emptyMsg}</p>
          </div>
        )}

        {!loading && scans.map(item => {
          const value = item.calculated_value ?? 0
          const date  = item.scanned_at ? new Date(item.scanned_at).toLocaleDateString() : '—'
          return (
            <div
              key={item.id}
              className="flex items-center justify-between border-[1.5px] border-[var(--ink-4)] px-3 py-2 gap-2"
            >
              <span className="font-data text-[11px] text-[var(--ink)] uppercase tracking-widest flex-1 truncate">
                {localName(item.material_type, language)}
              </span>
              <span className="font-data text-[11px] text-[var(--ink-3)] whitespace-nowrap">
                {(item.weight_kg ?? 0).toFixed(2)} kg
              </span>
              <span className="font-data text-[13px] text-[var(--green)] whitespace-nowrap">
                ฿{value.toFixed(0)}
              </span>
              <span className="font-data text-[10px] text-[var(--ink-4)] whitespace-nowrap">
                {date}
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
}

function BuyerProfile({ profile, session, t, language }) {
  const { shop } = useMyShop()

  const [accepted,   setAccepted]   = useState(profile?.accepted_materials ?? [])
  const [shopName,   setShopName]   = useState('')
  const [shopArea,   setShopArea]   = useState('')
  const [isOpen,     setIsOpen]     = useState(true)
  const [editingShop, setEditingShop] = useState(false)

  // Sync shop data once loaded
  useEffect(() => {
    if (!shop) return
    async function sync() {
      setShopName(shop.name ?? '')
      setShopArea(shop.area ?? '')
      setIsOpen(shop.is_open ?? true)
    }
    sync()
  }, [shop])

  function toggleMaterial(mat) {
    setAccepted(a => a.includes(mat) ? a.filter(m => m !== mat) : [...a, mat])
  }

  async function handleSaveMaterials() {
    if (!session?.user?.id) return
    await supabase.from('user_profiles').update({ accepted_materials: accepted }).eq('id', session.user.id)
    toast.success(t.shopUpdated)
  }

  async function handleSaveShop() {
    if (!shop?.id) return
    const { error } = await supabase
      .from('shops')
      .update({ name: shopName.trim(), area: shopArea.trim() })
      .eq('id', shop.id)
    if (error) { toast.error(error.message); return }
    toast.success(t.saveShopInfo)
    setEditingShop(false)
  }

  async function handleToggleOpen() {
    if (!shop?.id) return
    const next = !isOpen
    setIsOpen(next)
    try {
      await supabase.from('shops').update({ is_open: next }).eq('id', shop.id)
      toast.success(next ? t.shopResumeIntake : t.shopPauseIntake)
    } catch {
      setIsOpen(!next)
    }
  }

  return (
    <>
      {/* Identity card */}
      <Card className="w-full max-w-2xl flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={profile?.display_name ?? 'B'} />
          <div>
            <p className="font-body text-[17px] text-[var(--ink)] m-0 font-semibold">
              {profile?.display_name ?? 'Shop Owner'}
            </p>
            <p className="font-data text-[11px] text-[var(--ink-3)] m-0">{session?.user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-[var(--paper-2)] border-[1px] border-[var(--ink-4)] font-data text-[10px] text-[var(--ink-3)] uppercase">
              {t.roleBuyer}
            </span>
          </div>
        </div>
      </Card>

      {/* Shop info */}
      <Card className="w-full max-w-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.shopInfo}</span>
          <div className="flex items-center gap-2">
            {/* Open/close toggle */}
            {shop?.id && (
              <button
                onClick={handleToggleOpen}
                className={[
                  'flex items-center gap-1.5 px-3 py-1 font-data text-[10px] uppercase tracking-widest border-[1.5px] cursor-pointer transition-colors',
                  isOpen
                    ? 'border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-ink)]'
                    : 'border-[var(--orange)] text-[var(--orange)]',
                ].join(' ')}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-[var(--green-ink)]' : 'bg-[var(--orange)]'}`} />
                {isOpen ? t.shopOpen : t.shopClosed}
              </button>
            )}
            <button
              onClick={() => setEditingShop(e => !e)}
              className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer"
            >
              {editingShop ? t.cancelLabel : t.editShop}
            </button>
          </div>
        </div>

        {editingShop ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.shopName}</label>
              <input
                type="text"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.shopArea}</label>
              <input
                type="text"
                value={shopArea}
                onChange={e => setShopArea(e.target.value)}
                className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]"
              />
            </div>
            <Button variant="primary" onClick={handleSaveShop}>{t.saveShopInfo}</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="font-body text-[15px] text-[var(--ink)]">{shopName || '—'}</span>
            {shopArea && <span className="font-data text-[11px] text-[var(--ink-3)]">{shopArea}</span>}
          </div>
        )}
      </Card>

      {/* Accepted materials */}
      <Card className="w-full max-w-2xl flex flex-col gap-3">
        <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.acceptedMaterials}</span>
        <div className="flex flex-wrap gap-2">
          {Object.keys(WASTE_ITEMS).map(mat => (
            <button
              key={mat}
              onClick={() => toggleMaterial(mat)}
              className={[
                'px-3 py-1 font-data text-[11px] uppercase tracking-widest border-[1.5px] transition-colors cursor-pointer',
                accepted.includes(mat)
                  ? 'border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-ink)]'
                  : 'border-[var(--ink-4)] bg-[var(--paper)] text-[var(--ink-3)]',
              ].join(' ')}
            >
              {localName(mat, language)}
            </button>
          ))}
        </div>
        <Button variant="primary" onClick={handleSaveMaterials}>{t.savePricing}</Button>
      </Card>
    </>
  )
}

function AdminProfile({ profile, session, t }) {
  const [pending, setPending]   = useState(null)
  const [active, setActive]     = useState(null)
  const [flagged, setFlagged]   = useState(null)

  useEffect(() => {
    supabase.from('shops').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      .then(({ count }) => setPending(count ?? 0))
    supabase.from('shops').select('id', { count: 'exact', head: true }).eq('status', 'active')
      .then(({ count }) => setActive(count ?? 0))
    supabase.from('marketplace_posts').select('id', { count: 'exact', head: true }).eq('flagged', true)
      .then(({ count }) => setFlagged(count ?? 0))
  }, [])

  return (
    <Card className="w-full max-w-2xl flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar name={profile?.display_name ?? 'A'} />
        <div>
          <p className="font-body text-[17px] text-[var(--ink)] m-0 font-semibold">
            {profile?.display_name ?? 'Admin'}
          </p>
          <p className="font-data text-[11px] text-[var(--ink-3)] m-0">{session?.user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-[var(--orange)]/20 border-[1px] border-[var(--orange)] font-data text-[10px] text-[var(--orange)] uppercase">
            {t.adminBadge}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 border-t-[1.5px] border-[var(--ink-4)] pt-3">
        <div className="flex flex-col gap-0.5 items-center">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest text-center">{t.shopsToApprove}</span>
          <span className="font-brand text-[24px] text-[var(--orange)] leading-none">{pending ?? '—'}</span>
        </div>
        <div className="flex flex-col gap-0.5 items-center">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest text-center">{t.activeShops}</span>
          <span className="font-brand text-[24px] text-[var(--green)] leading-none">{active ?? '—'}</span>
        </div>
        <div className="flex flex-col gap-0.5 items-center">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest text-center">Flagged</span>
          <span className="font-brand text-[24px] text-[var(--ink)] leading-none">{flagged ?? '—'}</span>
        </div>
      </div>
    </Card>
  )
}

export function ProfilePage() {
  const t                      = useT()
  const dispatch               = useDispatch()
  const navigate               = useNavigate()
  const { session, profile }   = useSelector(s => s.user)
  const language               = useSelector(s => s.user.language)
  const role                   = profile?.role ?? 'user'

  async function handleSignOut() {
    await supabase.auth.signOut()
    dispatch(clearUser())
    navigate('/')
  }

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0 self-start max-w-2xl w-full">{t.profile}</h1>
      {role === 'user'  && <UserProfile  profile={profile} session={session} t={t} language={language} />}
      {role === 'buyer' && <BuyerProfile profile={profile} session={session} t={t} language={language} />}
      {role === 'admin' && <AdminProfile profile={profile} session={session} t={t} />}

      {/* Quick actions */}
      <div className="w-full max-w-2xl flex flex-col border-[1.5px] border-[var(--ink)] divide-y divide-[var(--ink-4)]">
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center justify-between px-4 py-3 bg-transparent border-none cursor-pointer text-left hover:bg-[var(--paper-2)] transition-colors"
        >
          <span className="font-data text-[12px] text-[var(--ink)] uppercase tracking-widest">
            {language === 'th' ? 'การตั้งค่า' : 'Settings'}
          </span>
          <span className="font-data text-[12px] text-[var(--ink-3)]">→</span>
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center justify-between px-4 py-3 bg-transparent border-none cursor-pointer text-left hover:bg-[var(--paper-2)] transition-colors"
        >
          <span className="font-data text-[12px] text-[var(--ink)] uppercase tracking-widest">
            {language === 'th' ? 'ช่วยเหลือ / FAQ' : 'Help & FAQ'}
          </span>
          <span className="font-data text-[12px] text-[var(--ink-3)]">support@greenplus.ai</span>
        </button>
        <button
          onClick={handleSignOut}
          className="flex items-center justify-between px-4 py-3 bg-transparent border-none cursor-pointer text-left hover:bg-[var(--paper-2)] transition-colors"
        >
          <span className="font-data text-[12px] text-[var(--orange)] uppercase tracking-widest">
            {t.logout}
          </span>
          <span className="font-data text-[12px] text-[var(--orange)]">→</span>
        </button>
      </div>
    </main>
  )
}
