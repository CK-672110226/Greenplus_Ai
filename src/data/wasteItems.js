// Chiang Mai market reference prices — May 2026 (PRD Section 8)
export const WASTE_ITEMS = {
  pet_bottle_clear: { name: 'PET Bottle (Clear)', name_th: 'ขวด PET ใส',           priceA: 9.00 },
  aluminum_can:     { name: 'Aluminium Can',       name_th: 'กระป๋องอะลูมิเนียม',  priceA: 62.00 },
  cardboard:        { name: 'Cardboard',           name_th: 'กระดาษลัง',            priceA: 4.50 },
  copper:           { name: 'Copper',              name_th: 'ทองแดง',               priceA: 382.00 },
  glass:            { name: 'Glass',               name_th: 'แก้ว',                 priceA: 2.00 },
  newspaper:        { name: 'Newspaper',           name_th: 'หนังสือพิมพ์',         priceA: 7.20 },
  mixed_plastic:    { name: 'Mixed Plastic',       name_th: 'พลาสติกรวม',           priceA: 18.50 },
  cooking_oil:      { name: 'Used Cooking Oil',    name_th: 'น้ำมันทอด',            priceA: 20.00 },
}

const GRADE_MULTIPLIER = { A: 1.00, B: 0.75, C: 0.40 }

export function pricePerKg(materialType, grade) {
  const item = WASTE_ITEMS[materialType]
  if (!item) return 0
  return +(item.priceA * (GRADE_MULTIPLIER[grade] ?? 0)).toFixed(2)
}

export function localName(materialType, language = 'th') {
  const item = WASTE_ITEMS[materialType]
  if (!item) return materialType
  return language === 'th' ? item.name_th : item.name
}
