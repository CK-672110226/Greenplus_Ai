import { useDispatch, useSelector } from 'react-redux'
import { setLanguage } from '../store/userSlice'
import { Card } from '../components/Card'
import { useT } from '../hooks/useT'

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

export function SettingsPage() {
  const dispatch             = useDispatch()
  const { profile, language } = useSelector(s => s.user)
  const t                    = useT()

  return (
    <main className="flex flex-col items-center px-6 py-12 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.settings}</h1>

      <Card className="w-full max-w-sm flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <label className="font-data text-[12px] text-[var(--ink-3)] uppercase tracking-widest">{t.language}</label>
          <div className="flex gap-3">
            <LangBtn active={language === 'th'} onClick={() => dispatch(setLanguage('th'))}>ภาษาไทย</LangBtn>
            <LangBtn active={language === 'en'} onClick={() => dispatch(setLanguage('en'))}>English</LangBtn>
          </div>
        </section>

        {profile && (
          <section className="flex flex-col gap-3 border-t-[1.5px] border-[var(--ink-4)] pt-4">
            <div className="flex flex-col gap-1">
              <span className="font-data text-[12px] text-[var(--ink-3)] uppercase tracking-widest">{t.role}</span>
              <span className="font-data text-[15px] text-[var(--ink)] uppercase">{profile.role}</span>
            </div>
            {profile.role === 'user' && (
              <div className="flex flex-col gap-1">
                <span className="font-data text-[12px] text-[var(--ink-3)] uppercase tracking-widest">{t.ecoPoints}</span>
                <span className="font-data text-[24px] text-[var(--green)] leading-none">{profile.eco_points ?? 0}</span>
              </div>
            )}
          </section>
        )}
      </Card>
    </main>
  )
}
