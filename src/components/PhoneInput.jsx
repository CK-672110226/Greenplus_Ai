import { memo, useState } from 'react'
import PropTypes from 'prop-types'
import { isPhoneValid, phoneDigitRange } from '../utils/phoneUtils'

const COUNTRIES = [
  { dial: '+66',  name: 'TH 🇹🇭' },
  { dial: '+856', name: 'LA 🇱🇦' },
  { dial: '+95',  name: 'MM 🇲🇲' },
  { dial: '+855', name: 'KH 🇰🇭' },
  { dial: '+84',  name: 'VN 🇻🇳' },
  { dial: '+86',  name: 'CN 🇨🇳' },
  { dial: '+81',  name: 'JP 🇯🇵' },
  { dial: '+1',   name: 'US 🇺🇸' },
]

export const PhoneInput = memo(function PhoneInput({
  value,
  onChange,
  dialCode,
  onDialChange,
  language,
  inputClassName,
}) {
  const [open, setOpen] = useState(false)
  const country  = COUNTRIES.find(c => c.dial === dialCode) ?? COUNTRIES[0]
  const digits   = (value ?? '').replace(/\D/g, '')
  const filled   = digits.length > 0
  const valid    = isPhoneValid(digits, dialCode)
  const { min, max } = phoneDigitRange(dialCode)
  const rangeStr = min === max ? `${min}` : `${min}–${max}`
  const hintText = language === 'th' ? `${rangeStr} หลัก` : `${rangeStr} digits`

  function handleInput(e) {
    onChange(e.target.value.replace(/\D/g, ''))
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="shrink-0 px-3 py-2 border-[1.5px] border-r-0 border-[var(--ink)] bg-[var(--paper-2)] font-data text-[12px] cursor-pointer whitespace-nowrap flex items-center gap-1.5 hover:bg-[var(--paper)]"
        >
          <span>{country.name}</span>
          <span className="text-[var(--ink-3)]">{country.dial}</span>
          <span className="text-[9px] text-[var(--ink-3)]">▾</span>
        </button>

        {open && (
          <div className="absolute top-full left-0 z-30 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] shadow-[2px_2px_0_var(--ink)] min-w-[160px]">
            {COUNTRIES.map(c => (
              <button
                key={c.dial}
                type="button"
                onClick={() => { onDialChange(c.dial); onChange(''); setOpen(false) }}
                className={[
                  'w-full px-3 py-2 text-left font-data text-[12px] flex justify-between items-center gap-3 cursor-pointer',
                  c.dial === dialCode ? 'bg-[var(--green-soft)]' : 'hover:bg-[var(--paper-2)]',
                ].join(' ')}
              >
                <span>{c.name}</span>
                <span className="text-[var(--ink-3)]">{c.dial}</span>
              </button>
            ))}
          </div>
        )}

        <input
          type="tel"
          inputMode="numeric"
          value={value ?? ''}
          onChange={handleInput}
          maxLength={max + 1}
          placeholder={dialCode === '+66' ? '0812345678' : hintText}
          className={inputClassName}
        />
      </div>

      <span className={`font-data text-[10px] ${filled && !valid ? 'text-[var(--orange)]' : 'text-[var(--ink-4)]'}`}>
        {filled && !valid
          ? (language === 'th' ? `ต้องใส่ ${hintText}` : `Must be ${hintText}`)
          : hintText}
      </span>
    </div>
  )
})

PhoneInput.propTypes = {
  value:          PropTypes.string.isRequired,
  onChange:       PropTypes.func.isRequired,
  dialCode:       PropTypes.string.isRequired,
  onDialChange:   PropTypes.func.isRequired,
  language:       PropTypes.string,
  inputClassName: PropTypes.string,
}
