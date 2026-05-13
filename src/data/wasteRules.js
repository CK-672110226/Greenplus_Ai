// Thai standard waste preparation rules (C-08)
export const WASTE_RULES = {
  pet_bottle_clear: [
    { severity: 'reject',  titleEn: 'No liquid residue allowed',                titleTh: 'ห้ามมีของเหลวเหลืออยู่' },
    { severity: 'warning', titleEn: 'Rinse clean, remove cap, crush flat',       titleTh: 'ล้างสะอาด ถอดฝา บีบแบน' },
  ],
  aluminum_can: [
    { severity: 'info',    titleEn: 'Can be crushed flat — no washing needed',   titleTh: 'บีบแบนได้ แต่ไม่ต้องล้าง' },
  ],
  cardboard: [
    { severity: 'warning', titleEn: 'Must be dry — no tape, no wet sections',    titleTh: 'ต้องแห้ง ไม่เปียก ไม่มีเทป' },
    { severity: 'info',    titleEn: 'Remove stickers for better price',           titleTh: 'ลอกสติ๊กเกอร์ออกได้ราคาดีกว่า' },
  ],
  newspaper: [
    { severity: 'warning', titleEn: 'Must be dry and not severely torn',          titleTh: 'ต้องแห้ง ไม่ฉีกขาดมาก' },
  ],
  copper: [
    { severity: 'warning', titleEn: 'Separate copper from plastic insulation',    titleTh: 'ต้องแยกจากสายไฟพลาสติก' },
  ],
  glass: [
    { severity: 'info',    titleEn: 'Rinse clean — clear glass fetches more',     titleTh: 'ล้างสะอาด แก้วใสได้ราคาดีกว่า' },
  ],
  cooking_oil: [
    { severity: 'reject',  titleEn: 'Must be sealed — no water contamination',    titleTh: 'บรรจุในภาชนะปิด ห้ามปนน้ำ' },
  ],
  mixed_plastic: [
    { severity: 'info',    titleEn: 'Sorting by plastic type fetches better price',titleTh: 'แยกประเภทพลาสติกได้ราคาดีกว่า' },
  ],
}

export function getRulesFor(materialType) {
  return WASTE_RULES[materialType] ?? []
}

export const SEVERITY_COLOR = {
  reject:  'var(--orange)',
  warning: '#B8860B',
  info:    'var(--ink-3)',
}
