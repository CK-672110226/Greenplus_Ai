import { useState } from 'react'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { WASTE_ITEMS, localName } from '../data/wasteItems'

const MOCK_SCAN_HISTORY = [
  { id: 1, materialType: 'aluminum_can',     grade: 'A', date: '13 May 2026', value: 1.44 },
  { id: 2, materialType: 'cardboard',         grade: 'B', date: '12 May 2026', value: 0.90 },
  { id: 3, materialType: 'pet_bottle_clear',  grade: 'A', date: '12 May 2026', value: 0.58 },
  { id: 4, materialType: 'copper',            grade: 'A', date: '11 May 2026', value: 30.00 },
  { id: 5, materialType: 'mixed_plastic',     grade: 'C', date: '10 May 2026', value: 0.35 },
]

const BUYER_ACCEPTED = ['aluminum_can', 'pet_bottle_clear', 'cardboard', 'copper']

const ADMIN_STATS = { shopsToApprove: 3, activeShops: 4, flaggedPosts: 1 }

function Avatar({ name }) {
  const initials = (name ?? 'U').slice(0, 2).toUpperCase()
  return (
    <div className="w-16 h-16 bg-[var(--green)] border-[1.5px] border-[var(--ink)] flex items-center justify-center shadow-[2px_2px_0_var(--ink)]">
      <span className="font-brand text-[22px] text-[#062040]">{initials}</span>
    </div>
  )
}

function UserProfile({ profile, session, t, language }) {
  const totalValue = MOCK_SCAN_HISTORY.reduce((s, h) => s + h.value, 0)

  return (
    <>
      {/* Identity */}
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
        <div className="flex gap-6 border-t-[1.5px] border-[var(--ink-4)] pt-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.ecoPoints}</span>
            <span className="font-brand text-[24px] text-[var(--green)] leading-none">{profile?.eco_points ?? 0}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.totalScans}</span>
            <span className="font-brand text-[24px] text-[var(--ink)] leading-none">{MOCK_SCAN_HISTORY.length}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">Total ฿</span>
            <span className="font-brand text-[24px] text-[var(--green)] leading-none">฿{totalValue.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Scan history */}
      <div className="w-full max-w-sm flex flex-col gap-2">
        <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.scanHistory}</span>
        {MOCK_SCAN_HISTORY.map(h => (
          <Card key={h.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GradeTag grade={h.grade} />
              <span className="font-body text-[14px] text-[var(--ink)]">{localName(h.materialType, language)}</span>
            </div>
            <div className="text-right">
              <p className="font-data text-[13px] text-[var(--green)] m-0">฿{h.value.toFixed(2)}</p>
              <p className="font-data text-[10px] text-[var(--ink-3)] m-0">{h.date}</p>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

function BuyerProfile({ profile, session, t, language }) {
  const [accepted, setAccepted] = useState(BUYER_ACCEPTED)

  function toggle(mat) {
    setAccepted(a => a.includes(mat) ? a.filter(m => m !== mat) : [...a, mat])
  }

  function handleSave() {
    toast.success('Accepted materials updated')
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
          <span className="font-brand text-[24px] text-[var(--orange)] leading-none">{ADMIN_STATS.shopsToApprove}</span>
        </div>
        <div className="flex flex-col gap-0.5 items-center">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest text-center">{t.activeShops}</span>
          <span className="font-brand text-[24px] text-[var(--green)] leading-none">{ADMIN_STATS.activeShops}</span>
        </div>
        <div className="flex flex-col gap-0.5 items-center">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest text-center">Flagged</span>
          <span className="font-brand text-[24px] text-[var(--ink)] leading-none">{ADMIN_STATS.flaggedPosts}</span>
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
