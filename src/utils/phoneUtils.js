const COUNTRY_DIGITS = {
  '+66':  { min: 9,  max: 10 },
  '+856': { min: 8,  max: 9  },
  '+95':  { min: 7,  max: 10 },
  '+855': { min: 8,  max: 9  },
  '+84':  { min: 9,  max: 10 },
  '+86':  { min: 11, max: 11 },
  '+81':  { min: 10, max: 11 },
  '+1':   { min: 10, max: 10 },
}

export function isPhoneValid(digits, dialCode) {
  const len = (digits ?? '').replace(/\D/g, '').length
  const rule = COUNTRY_DIGITS[dialCode] ?? { min: 6, max: 15 }
  return len >= rule.min && len <= rule.max
}

export function phoneDigitRange(dialCode) {
  return COUNTRY_DIGITS[dialCode] ?? { min: 6, max: 15 }
}
