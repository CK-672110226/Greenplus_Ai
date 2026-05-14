import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setLanguage, toggleDarkMode } from '../store/userSlice'
import { useT } from '../hooks/useT'
import { SectionDivider } from '../components/SectionDivider'

function LangBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-4 py-2 font-body text-[16px] border-[1.5px] transition-all',
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

export function SettingsPage() {
  const dispatch = useDispatch()
  const { profile, language, darkMode } = useSelector(s => s.user)
  const t = useT()

  const [priceAlerts, setPriceAlerts]       = useState(true)
  const [pickupReminders, setPickupReminders] = useState(true)
  const [marketing, setMarketing]           = useState(false)

  return (
    <main className="flex flex-col px-4 py-6 gap-4 max-w-xl mx-auto w-full">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.settings}</h1>

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
        <Toggle on={priceAlerts}      onToggle={() => setPriceAlerts(v => !v)}      label="Price alerts" />
        <Toggle on={pickupReminders}  onToggle={() => setPickupReminders(v => !v)}  label="Pickup reminders" />
        <Toggle on={marketing}        onToggle={() => setMarketing(v => !v)}        label="Promotions & marketing" />
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
              onClick={() => {}}
            >
              <span className="font-body text-[15px] text-[var(--ink)]">Export my data</span>
              <span className="font-data text-[11px] text-[var(--ink-3)]">→</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-between py-3 bg-transparent border-none cursor-pointer text-left w-full"
              onClick={() => {}}
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
