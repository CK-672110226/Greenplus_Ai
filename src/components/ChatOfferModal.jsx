import { useState } from 'react'
import { Button } from './Button'
import { WASTE_ITEMS, localName } from '../data/wasteItems'

export function ChatOfferModal({ onSend, onClose, language = 'en' }) {
  const [material, setMaterial] = useState('')
  const [price, setPrice]       = useState('')
  const [weight, setWeight]     = useState('')
  const [date, setDate]         = useState('')

  function handleSend() {
    if (!material || !price) return
    onSend({
      type: 'offer',
      material,
      price: parseFloat(price),
      weight: weight ? parseFloat(weight) : null,
      date: date || null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-[#1A1A1Ae6] flex items-end md:items-center md:justify-center z-50">
      <div className="w-full max-w-sm mx-4 md:mx-0 bg-[var(--paper)] border-[2px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] p-6 flex flex-col gap-4 mb-6 md:mb-0">

        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-[0.15em]">Send Offer</span>
          <button
            onClick={onClose}
            className="font-data text-[12px] text-[var(--ink-3)] bg-transparent border-none cursor-pointer hover:text-[var(--ink)]"
          >
            &#x2715;
          </button>
        </div>

        {/* Material */}
        <div className="flex flex-col gap-1.5">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">Material</span>
          <select
            value={material}
            onChange={e => setMaterial(e.target.value)}
            className="w-full px-3 py-2 border-[1.5px] border-[var(--ink-4)] focus:border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none"
          >
            <option value="">Select material&hellip;</option>
            {Object.keys(WASTE_ITEMS).map(k => (
              <option key={k} value={k}>{localName(k, language)}</option>
            ))}
          </select>
        </div>

        {/* Price + Weight */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">Price (&#x0E3F;/kg)</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink-4)] focus:border-[var(--ink)] bg-[var(--paper)] font-data text-[14px] outline-none"
              placeholder="0.00"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">Weight (kg)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink-4)] focus:border-[var(--ink)] bg-[var(--paper)] font-data text-[14px] outline-none"
              placeholder="optional"
            />
          </div>
        </div>

        {/* Pickup Date */}
        <div className="flex flex-col gap-1.5">
          <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">Pickup Date</span>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 border-[1.5px] border-[var(--ink-4)] focus:border-[var(--ink)] bg-[var(--paper)] font-data text-[14px] outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="primary" fullWidth onClick={handleSend} disabled={!material || !price}>
            Send Offer &rarr;
          </Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}
