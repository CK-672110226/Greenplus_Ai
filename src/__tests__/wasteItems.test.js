import { describe, it, expect } from 'vitest'
import { WASTE_ITEMS, pricePerKg, localName } from '../data/wasteItems'

describe('wasteItems', () => {
  it('has 8 material types', () => {
    expect(Object.keys(WASTE_ITEMS).length).toBe(8)
  })

  it('returns base price', () => {
    expect(pricePerKg('aluminum_can')).toBe(40)
  })

  it('returns same price regardless of any extra arg', () => {
    expect(pricePerKg('aluminum_can', false)).toBe(40)
    expect(pricePerKg('aluminum_can', true)).toBe(40)
  })

  it('cardboard base price is 3', () => {
    expect(pricePerKg('cardboard')).toBe(3)
  })

  it('localName returns Thai for th', () => {
    expect(localName('aluminum_can', 'th')).toBe(WASTE_ITEMS.aluminum_can.nameTh)
  })

  it('localName returns English for en', () => {
    expect(localName('aluminum_can', 'en')).toBe(WASTE_ITEMS.aluminum_can.nameEn)
  })

  it('returns 0 for unknown materialType', () => {
    expect(pricePerKg('unknown_material')).toBe(0)
  })

  it('all 8 materials have positive base prices', () => {
    Object.values(WASTE_ITEMS).forEach(item => {
      expect(item.basePrice).toBeGreaterThan(0)
    })
  })
})
