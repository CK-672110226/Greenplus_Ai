import { describe, it, expect } from 'vitest'
import { WASTE_ITEMS, pricePerKg, localName } from '../data/wasteItems'

describe('wasteItems', () => {
  it('has 8 material types', () => {
    expect(Object.keys(WASTE_ITEMS).length).toBe(8)
  })

  it('grade A gives 1.2x base price', () => {
    expect(pricePerKg('aluminum_can', 'A')).toBe(48)
  })

  it('grade B gives base price', () => {
    expect(pricePerKg('aluminum_can', 'B')).toBe(40)
  })

  it('grade C gives 0.7x base price', () => {
    expect(pricePerKg('cardboard', 'C')).toBeCloseTo(2.1, 1)
  })

  it('localName returns Thai for th', () => {
    expect(localName('aluminum_can', 'th')).toBe(WASTE_ITEMS.aluminum_can.nameTh)
  })

  it('localName returns English for en', () => {
    expect(localName('aluminum_can', 'en')).toBe(WASTE_ITEMS.aluminum_can.nameEn)
  })

  it('returns 0 for unknown materialType', () => {
    expect(pricePerKg('unknown_material', 'A')).toBe(0)
  })
})
