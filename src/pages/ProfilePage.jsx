import { useState } from 'react'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { useScanHistory } from '../hooks/useScanHistory'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { WASTE_ITEMS, localName } from '../data/wasteItems'
import { supabase } from '../lib/supabase'

function Avatar({ name }) {
  const initials = (name ?? 'U').slice(0, 2).toUpperCase()
  return (
    <div className="w-16 h-16 bg-[var(--green)] border-[1.5px] border-[var(--ink)] flex items-center justify-center shadow-[2px_2px_0_var(--ink)]">
      <span className="font-brand text-[22px] text-[#062040]">{initials}</span>
    </div>
  )
}

function UserProfile({ profile, session, t, language }) {
  const { scans, loading, totalKg, totalValue, totalCo2 } = useScanHistory()

  const emptyMsg = language === 'th'
    ? 'ยังไม่มีการสแกน ชี้กล้องไปที่วัสดุรีไซเคิลเพื่อเริ่มต้น'
    : 'No scans yet. Point your camera at any recyclable item to start.'

  return (
    <>
      <Card className="w-full max-w-sm flex flex-col gap-4">
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
        {/* Lifetime impact grid */}
        <div className="grid grid-cols-3 border-t-[1.5px] border-[var(--ink-4)] pt-3">
          <div className="flex flex-col gap-0.5 border-r border-[var(--ink-4)] pr-3">
            <span className="font-brand text-[22px] text-[var(--ink)] leading-none">{totalKg.toFixed(1)}</span>
            <span className="font-data text-[9px] text-[var(--ink-3)] uppercase tracking-widest leading-tight">kg recycled</span>
          </div>
          <div className="flex flex-col gap-0.5 border-r border-[var(--ink-4)] px-3">
            <span className="font-data text-[22px] text-[var(--green)] leading-none">฿{totalValue.toFixed(0)}</span>
            <span className="font-data text-[9px] text-[var(--ink-3)] uppercase tracking-widest leading-tight">earned</span>
          </div>
          <div className="flex flex-col gap-0.5 pl-3">
            <span className="font-brand text-[22px] text-[var(--ink)] leading-none">{totalCo2}</span>
            <span className="font-data text-[9px] text-[var(--ink-3)] uppercase tracking-widest leading-tight">kg CO₂ saved</span>
          </div>
        </div>
      </Card>

      {/* Scan history */}
      <div className="w-full max-w-sm flex flex-col gap-2">
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
  const [accepted, setAccepted] = useState(profile?.accepted_materials ?? [])

  function toggle(mat) {
    setAccepted(a => a.includes(mat) ? a.filter(m => m !== mat) : [...a, mat])
  }

  async function handleSave() {
    if (!session?.user?.id) return
    await supabase
      .from('user_profiles')
      .update({ accepted_materials: accepted })
      .eq('id', session.user.id)
    toast.success('Materials saved')
  }

  return (
    <>
      <Card className="w-full max-w-sm flex flex-col gap-4">
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

      <Card className="w-full max-w-sm flex flex-col gap-3">
        <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.acceptedMaterials}</span>
        <div className="flex flex-wrap gap-2">
          {Object.keys(WASTE_ITEMS).map(mat => (
            <button
              key={mat}
              onClick={() => toggle(mat)}
              className={[
                'px-3 py-1 font-data text-[11px] uppercase tracking-widest border-[1.5px] transition-colors',
                accepted.includes(mat)
                  ? 'border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-ink)]'
                  : 'border-[var(--ink-4)] bg-[var(--paper)] text-[var(--ink-3)]',
              ].join(' ')}
            >
              {localName(mat, language)}
            </button>
          ))}
        </div>
        <Button variant="primary" onClick={handleSave}>{t.savePricing}</Button>
      </Card>
    </>
  )
}

function AdminProfile({ profile, session, t }) {
  return (
    <Card className="w-full max-w-sm flex flex-col gap-4">
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
          <span className="font-brand text-[24px] text-[var(--orange)] leading-none">0</span>
        </div>
        <div className="flex flex-col gap-0.5 items-center">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest text-center">{t.activeShops}</span>
          <span className="font-brand text-[24px] text-[var(--green)] leading-none">0</span>
        </div>
        <div className="flex flex-col gap-0.5 items-center">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest text-center">Flagged</span>
          <span className="font-brand text-[24px] text-[var(--ink)] leading-none">0</span>
        </div>
      </div>
    </Card>
  )
}

export function ProfilePage() {
  const t                      = useT()
  const { session, profile }   = useSelector(s => s.user)
  const language               = useSelector(s => s.user.language)
  const role                   = profile?.role ?? 'user'

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0 self-start max-w-sm w-full">{t.profile}</h1>
      {role === 'user'  && <UserProfile  profile={profile} session={session} t={t} language={language} />}
      {role === 'buyer' && <BuyerProfile profile={profile} session={session} t={t} language={language} />}
      {role === 'admin' && <AdminProfile profile={profile} session={session} t={t} />}
    </main>
  )
}
