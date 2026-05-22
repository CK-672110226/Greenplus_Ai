# Fix-PhoneLineValidation.00

**Date:** 22 May 2026 (22 พฤษภาคม 2569)
**PR:** #107 — feat(input): phone country selector + LINE ID validation
**Branch:** feat/phone-line-validation

## Overview

Previously, phone and LINE ID inputs accepted any free-form text with no format enforcement. Phone numbers could be entered without a country code, making digit-count validation impossible. LINE IDs had no format check at all. This fix adds a country dial-code selector to all phone inputs and inline format validation for LINE ID.

## Reason

User report: "กันเรื่อง input อิสระ — มือถือให้เลือกเลขประเทศก่อน" (free-form phone fields need country code selection and digit count enforcement; LINE optional but validated when filled).

## Changes

### `src/utils/phoneUtils.js` (new file)
- `COUNTRY_DIGITS` map: minimum and maximum digit counts per dial code (TH +66, LA +856, MM +95, KH +855, VN +84, CN +86, JP +81, US +1).
- `isPhoneValid(digits, dialCode)` — returns true when stripped digit count is within the country's range.
- `phoneDigitRange(dialCode)` — returns `{ min, max }` for the hint label.
- Extracted to a separate file to satisfy the `react-refresh/only-export-components` ESLint rule (can't export both a component and utilities from the same file).

### `src/components/PhoneInput.jsx` (new file)
- `<select>` for dial code (flag emoji + code); 8 countries.
- `<input type="tel">` that strips non-digits on change.
- Shows digit-count hint (e.g. "9–10 digits") below the field.
- Orange border + error message when digit count is wrong.
- Props: `value`, `onChange`, `dialCode`, `onDialChange`, `language`, `inputClassName`.

### `src/pages/BuyerOnboardingPage.jsx`
- Replaced `<input type="tel">` with `<PhoneInput>`.
- Added `phoneDialCode: '+66'` to form state.
- Next button disabled when phone is invalid or LINE ID is filled but malformed.
- LINE ID regex: `^@?[a-zA-Z0-9._-]{6,20}$` (optional `@` prefix, 6–20 alphanumeric chars).

### `src/pages/ProfilePage.jsx`
- Replaced shop phone `<input type="tel">` with `<PhoneInput>`.
- Added `shopPhoneDialCode` state (default `'+66'`).
- Save button disabled while phone is invalid.

## Validation

- Thai number (09xxxxxxxx): 10 digits, passes for +66.
- Too few digits: orange error shown, Next/Save disabled.
- LINE ID `@greenplus`: passes. `abc`: fails (too short). No value: passes (optional).
- Lint: clean. Tests: not applicable (UI component).

## Notes

- `maxLength` and further constraints are applied separately in Fix-InputValidationAudit.
- The react-refresh split (utils vs component) is required by CI ESLint — importing from `phoneUtils.js` directly in pages keeps the component file export-clean.
