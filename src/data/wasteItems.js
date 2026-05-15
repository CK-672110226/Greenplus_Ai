export const WASTE_ITEMS = {
  pet_bottle_clear: { nameEn: 'Clear PET Bottle',  nameTh: 'ขวดพลาสติก PET ใส', basePrice: 8   },
  aluminum_can:     { nameEn: 'Aluminum Can',       nameTh: 'กระป๋องอะลูมิเนียม',  basePrice: 40  },
  cardboard:        { nameEn: 'Cardboard',          nameTh: 'กล่องกระดาษ',          basePrice: 3   },
  newspaper:        { nameEn: 'Newspaper',          nameTh: 'หนังสือพิมพ์',          basePrice: 2   },
  mixed_plastic:    { nameEn: 'Mixed Plastic',      nameTh: 'พลาสติกรวม',           basePrice: 5   },
  copper:           { nameEn: 'Copper',             nameTh: 'ทองแดง',               basePrice: 200 },
  glass:            { nameEn: 'Glass',              nameTh: 'แก้ว',                 basePrice: 1   },
  cooking_oil:      { nameEn: 'Cooking Oil',        nameTh: 'น้ำมันพืชใช้แล้ว',     basePrice: 12  },
}

export function pricePerKg(materialType, clean = true) {
  const item = WASTE_ITEMS[materialType]
  if (!item) return 0
  return item.basePrice * (clean === false ? 0.7 : 1.0)
}

export function localName(materialType, language) {
  const item = WASTE_ITEMS[materialType]
  if (!item) return materialType
  return language === 'th' ? item.nameTh : item.nameEn
}
