import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setLanguage, toggleDarkMode, setProfile, clearUser } from '../store/userSlice'
import { useT } from '../hooks/useT'
import { SectionDivider } from '../components/SectionDivider'
import { useSettingsActions } from '../hooks/useSettingsActions'
import { toast } from 'sonner'

function LangBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-4 py-2 font-body text-[16px] border-[1.5px] transition-all cursor-pointer',
        active
          ? 'border-[var(--ink)] bg-[var(--green)] text-[#062040] shadow-[2px_2px_0_var(--ink)]'
          : 'border-[var(--ink-4)] bg-[var(--paper)] text-[var(--ink-3)] hover:border-[var(--ink)]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function Toggle({ on, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between py-2.5 bg-transparent border-none cursor-pointer w-full p-0"
    >
      <span className="font-body text-[15px] text-[var(--ink)]">{label}</span>
      <span
        className={`w-10 h-5 border-[1.5px] border-[var(--ink)] relative transition-colors flex-shrink-0 ${on ? 'bg-[var(--green)]' : 'bg-[var(--ink-4)]'}`}
      >
        <span
          className="absolute top-0.5 w-3 h-3 bg-[var(--paper)] border-[1px] border-[var(--ink)] transition-all"
          style={{ left: on ? 'calc(100% - 14px)' : '2px' }}
        />
      </span>
    </button>
  )
}

const DEFAULT_PREFS = { price_alerts: true, pickup_reminders: true, marketing: false }

export function SettingsPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { profile, session, language, darkMode } = useSelector(s => s.user)
  const t = useT()

  const settingsActions = useSettingsActions()
  const prefs = { ...DEFAULT_PREFS, ...(profile?.notification_prefs ?? {}) }

  async function togglePref(key) {
    const next = { ...prefs, [key]: !prefs[key] }
    dispatch(setProfile({ ...profile, notification_prefs: next }))
    await settingsActions.updatePrefs(session?.user?.id, next)
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      language === 'th'
        ? 'ลบบัญชีถาวร? ไม่สามารถกู้คืนได้'
        : 'Permanently delete your account? This cannot be undone.'
    )
    if (!confirmed) return
    try {
      // Soft-deletes profile row, then signs out.
      // TODO: hard-delete via Edge Function (supabase.rpc('delete_my_account'))
      // — auth user persists until server-side admin call.
      await settingsActions.deleteAccount(session.user.id)
      dispatch(clearUser())
      navigate('/')
    } catch {
      toast.error('Could not delete account. Please contact support.')
    }
  }

  async function handleExport() {
    if (!session?.user?.id) return
    const { scans, bookings } = await settingsActions.exportData(session.user.id)

    function escapeCell(v) {
      return `"${String(v ?? '').replace(/"/g, '""')}"`
    }

    const scanHeaders    = scans.length    > 0 ? Object.keys(scans[0])    : []
    const bookingHeaders = bookings.length > 0 ? Object.keys(bookings[0]) : []
    const allColumns     = ['record_type', ...new Set([...scanHeaders, ...bookingHeaders])]
    const headerRow      = allColumns.join(',')

    function toAlignedRow(row, type) {
      return [escapeCell(type), ...allColumns.slice(1).map(col => escapeCell(row[col]))].join(',')
    }

    const csv  = [headerRow, ...scans.map(r => toAlignedRow(r, 'scan')), ...bookings.map(r => toAlignedRow(r, 'booking'))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `greenplus-data-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="flex flex-col px-4 py-6 gap-4 max-w-2xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-[0.15em]">Settings</span>
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.settings}</h1>
      </div>

      {/* Language */}
      <section className="flex flex-col gap-3">
        <SectionDivider label={t.language} />
        <div className="flex gap-3">
          <LangBtn active={language === 'th'} onClick={() => dispatch(setLanguage('th'))}>ภาษาไทย</LangBtn>
          <LangBtn active={language === 'en'} onClick={() => dispatch(setLanguage('en'))}>English</LangBtn>
        </div>
      </section>

      {/* Appearance */}
      <section className="flex flex-col gap-1">
        <SectionDivider label={t.appearance} />
        <Toggle on={darkMode} onToggle={() => dispatch(toggleDarkMode())} label={t.darkMode} />
      </section>

      {/* Notifications */}
      <section className="flex flex-col gap-1">
        <SectionDivider label="notifications" />
        <Toggle on={prefs.price_alerts}      onToggle={() => togglePref('price_alerts')}      label="Price alerts" />
        <Toggle on={prefs.pickup_reminders}  onToggle={() => togglePref('pickup_reminders')}  label="Pickup reminders" />
        <Toggle on={prefs.marketing}         onToggle={() => togglePref('marketing')}         label="Promotions & marketing" />
      </section>

      {/* Account */}
      {profile && (
        <section className="flex flex-col gap-1">
          <SectionDivider label="account" />
          <div className="flex flex-col divide-y divide-[var(--ink-4)]">
            <div className="flex items-center justify-between py-3">
              <span className="font-body text-[15px] text-[var(--ink)]">Role</span>
              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{profile.role}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="font-body text-[15px] text-[var(--ink)]">Linked accounts</span>
              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Google</span>
            </div>
            <button
              type="button"
              className="flex items-center justify-between py-3 bg-transparent border-none cursor-pointer text-left w-full"
              onClick={handleExport}
            >
              <span className="font-body text-[15px] text-[var(--ink)]">Export my data</span>
              <span className="font-data text-[11px] text-[var(--ink-3)]">→</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-between py-3 bg-transparent border-none cursor-pointer text-left w-full"
              onClick={handleDeleteAccount}
            >
              <span className="font-body text-[15px] text-[var(--orange)]">Delete account</span>
              <span className="font-data text-[11px] text-[var(--orange)]">→</span>
            </button>
          </div>
        </section>
      )}

      {/* Version footer */}
      <div className="pt-6 mt-2">
        <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">
          v0.5.0 · build {new Date().toISOString().slice(0, 10).replace(/-/g, '')}
        </span>
      </div>
    </main>
  )
}
