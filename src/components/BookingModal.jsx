import { pricePerKg, localName } from '../data/wasteItems'
import { Button } from './Button'

/**
 * BookingModal — bottom-sheet on mobile, centered dialog on desktop.
 *
 * Props:
 *   shop     { id, name, dist, area }
 *   basket   array of waste basket items from Redux wasteSlice
 *   language 'th' | 'en'
 *   onConfirm(shop) — called when user taps Confirm; parent dispatches addBooking
 *   onClose()       — called when user taps Cancel or backdrop
 */
export function BookingModal({ shop, basket, language, onConfirm, onClose }) {
  if (!shop) return null

  // Only include items the user has not skipped
  const activeItems = (basket ?? []).filter(item => !item.skipped)

  const totalValue = activeItems.reduce((sum, item) => {
    return sum + pricePerKg(item.materialType, item.grade) * (item.weight ?? 0)
  }, 0)

  const label = {
    summary: language === 'th' ? 'สรุปการจอง' : 'Booking Summary',
    confirm: language === 'th' ? 'ยืนยัน' : 'Confirm',
    cancel:  language === 'th' ? 'ยกเลิก' : 'Cancel',
    total:   language === 'th' ? 'มูลค่าโดยประมาณ' : 'Estimated Total',
    empty:   language === 'th' ? 'ตะกร้าว่าง' : 'Basket is empty',
    dist:    language === 'th' ? 'กม.' : 'km',
  }

  function handleConfirm() {
    onConfirm(shop)
    onClose()
  }

  return (
    /* Backdrop — click outside to dismiss */
    <div
      className="fixed inset-0 z-50 bg-[#1A1A1Ae6] flex items-end md:items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label.summary}
    >
      {/* Card — stop propagation so clicks inside don't close the modal */}
      <div
        className="w-full max-w-sm bg-[var(--paper)] border-[2px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] p-6 flex flex-col gap-4 mx-4 md:mx-0 mb-4 md:mb-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Shop header */}
        <div className="flex flex-col gap-1">
          <h2 className="font-brand text-[20px] leading-tight text-[var(--ink)]">
            {shop.name}
          </h2>
          <span className="font-data text-[11px] text-[var(--ink-3)]">
            {shop.area}
            {shop.dist != null && (
              <> &bull; {shop.dist} {label.dist}</>
            )}
          </span>
        </div>

        {/* Section label */}
        <p className="font-data uppercase text-[11px] tracking-wider text-[var(--ink-3)] border-b border-[var(--ink-4)] pb-1">
          {label.summary}
        </p>

        {/* Basket item list */}
        {activeItems.length === 0 ? (
          <p className="font-body text-[14px] text-[var(--ink-3)] text-center py-2">
            {label.empty}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {activeItems.map(item => {
              const unitPrice = pricePerKg(item.materialType, item.grade)
              const itemValue = unitPrice * (item.weight ?? 0)
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col">
                    <span className="font-body text-[14px] text-[var(--ink)]">
                      {localName(item.materialType, language)}
                    </span>
                    <span className="font-data text-[11px] text-[var(--ink-3)]">
                      {item.weight ?? 0} kg &times; ฿{unitPrice}/kg
                    </span>
                  </div>
                  <span className="font-data text-[14px] text-[var(--ink-2)] whitespace-nowrap">
                    ฿{itemValue.toFixed(0)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        {/* Total */}
        <div className="flex items-center justify-between border-t border-[var(--ink-4)] pt-3">
          <span className="font-data uppercase text-[11px] text-[var(--ink-3)]">
            {label.total}
          </span>
          <span className="font-brand text-[22px] text-[var(--green)]">
            ฿{totalValue.toFixed(0)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            variant="primary"
            fullWidth
            onClick={handleConfirm}
            disabled={activeItems.length === 0}
          >
            {label.confirm}
          </Button>
          <Button variant="secondary" fullWidth onClick={onClose}>
            {label.cancel}
          </Button>
        </div>
      </div>
    </div>
  )
}
