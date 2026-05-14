const TZ = 'Asia/Bangkok'

export function nowBangkok() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TZ }))
}

export function todayBangkok() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
}

export function hourBangkok() {
  return parseInt(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hour12: false }).format(new Date()), 10)
}

export function dateLabelBangkok(isoString) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(isoString))
}

export function weeklyBuckets(items, valueKey = 'weight') {
  const today = nowBangkok()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const label = d.toLocaleString('en-US', { timeZone: TZ, weekday: 'narrow' })
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)
    return { label, dateStr, val: 0 }
  })

  for (const item of items) {
    if (!item.scannedAt) continue
    const d = dateLabelBangkok(item.scannedAt)
    const bucket = days.find(b => b.dateStr === d)
    if (bucket) bucket.val = parseFloat((bucket.val + (item[valueKey] ?? 0)).toFixed(2))
  }

  return days.map(({ label, val }) => ({ label, val }))
}
