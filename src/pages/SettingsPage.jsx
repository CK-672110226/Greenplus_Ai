import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setLanguage, toggleDarkMode, setProfile, clearUser } from '../store/userSlice'
import { useT } from '../hooks/useT'
import { SectionDivider } from '../components/SectionDivider'
import { supabase } from '../lib/supabase'
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

  const prefs = { ...DEFAULT_PREFS, ...(profile?.notification_prefs ?? {}) }

  async function togglePref(key) {
    const next = { ...prefs, [key]: !prefs[key] }
    dispatch(setProfile({ ...profile, notification_prefs: next }))
    if (session?.user?.id) {
      await supabase
        .from('user_profiles')
        .update({ notification_prefs: next })
        .eq('id', session.user.id)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      language === 'th'
        ? 'ลบบัญชีถาวร? ไม่สามารถกู้คืนได้'
        : 'Permanently delete your account? This cannot be undone.'
    )
    if (!confirmed) return
    try {
      // Step 1: Soft-delete the profile row so the account is invisible to the app.
      await supabase
        .from('user_profiles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', session.user.id)

      // TODO: hard-delete via Edge Function — the Supabase auth user persists
      // until an admin calls supabase.auth.admin.deleteUser() server-side.
      // supabase.auth.admin.deleteUser() requires the service-role key and must
      // not be called from client code. Wire up an Edge Function or DB trigger
      // (e.g. supabase.rpc('delete_my_account')) to complete hard-deletion.

      // Step 2: End the session immediately so the user cannot re-authenticate.
      await supabase.auth.signOut()
      dispatch(clearUser())
      navigate('/')
    } catch {
      toast.error('Could not delete account. Please contact support.')
    }
  }

  async function handleExport() {
    if (!session?.user?.id) return
    const [{ data: scans }, { data: bookings }] = await Promise.all([
      supabase.from('scan_history').select('*').eq('user_id', session.user.id).order('scanned_at', { ascending: false }),
      supabase.from('bookings').select('*').eq('seller_id', session.user.id).order('created_at', { ascending: false }),
    ])

    // Build CSV: tag each row with a "record_type" column so scans and bookings
    // can coexist in a single file without losing context.
    function escapeCell(v) {
      return `"${String(v ?? '').replace(/"/g, '""')}"`
    }
    const scanRows    = scans    ?? []
    const bookingRows = bookings ?? []

    // Derive headers from the first available row of each type.
    const scanHeaders    = scanRows.length    > 0 ? Object.keys(scanRows[0])    : []
    const bookingHeaders = bookingRows.length > 0 ? Object.keys(bookingRows[0]) : []

    // Collect all unique column names (order: record_type first, then union of both).
    const allColumns = ['record_type', ...new Set([...scanHeaders, ...bookingHeaders])]
    const headerRow  = allColumns.join(',')

    // Build data rows using the full column set so every row has the same width.
    function toAlignedRow(row, type) {
      return [
        escapeCell(type),
        ...allColumns.slice(1).map(col => escapeCell(row[col])),
      ].join(',')
    }

    const dataRows = [
      ...scanRows.map(r => toAlignedRow(r, 'scan')),
      ...bookingRows.map(r => toAlignedRow(r, 'booking')),
    ]

    const csv  = [headerRow, ...dataRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `greenplus-data-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="flex flex-col px-4 py-6 gap-4 max-w-xl mx-auto w-full">
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
