// Thai standard waste preparation rules (C-08)
export const WASTE_RULES = {
  pet_bottle_clear: [
    { severity: 'reject',  titleEn: 'No liquid residue allowed',                   titleTh: 'ห้ามมีของเหลวเหลืออยู่' },
    { severity: 'warning', titleEn: 'Rinse, remove cap, crush flat',               titleTh: 'ล้างสะอาด ถอดฝา บีบแบน' },
    { severity: 'info',    titleEn: 'Label does not need to be removed',            titleTh: 'ฉลากไม่ต้องลอกออก' },
    { severity: 'info',    titleEn: 'Clear PET earns more than coloured PET',      titleTh: 'ขวด PET ใสได้ราคาดีกว่า PET สี' },
  ],
  aluminum_can: [
    { severity: 'info',    titleEn: 'Crush flat to save space — no washing needed', titleTh: 'บีบแบนได้ ไม่ต้องล้าง ประหยัดเนื้อที่' },
    { severity: 'warning', titleEn: 'Separate from steel cans — steel earns less', titleTh: 'แยกออกจากกระป๋องเหล็ก เหล็กราคาต่ำกว่า' },
    { severity: 'info',    titleEn: 'Pour out any remaining liquid before selling', titleTh: 'เทของเหลวที่ค้างออกก่อนนำมาขาย' },
  ],
  cardboard: [
    { severity: 'reject',  titleEn: 'Wet or mouldy cardboard is rejected',         titleTh: 'ห้ามเปียกชื้นหรือขึ้นรา' },
    { severity: 'warning', titleEn: 'Remove tape, staples, and foam inserts',      titleTh: 'ลอกเทป ลวดเย็บ และโฟมออกก่อน' },
    { severity: 'info',    titleEn: 'Fold flat and bundle — easier to weigh',      titleTh: 'พับแบนมัดรวมกัน ชั่งน้ำหนักง่ายกว่า' },
    { severity: 'info',    titleEn: 'Remove stickers for better price',            titleTh: 'ลอกสติ๊กเกอร์ออกได้ราคาดีกว่า' },
  ],
  newspaper: [
    { severity: 'reject',  titleEn: 'Wet or stained paper is rejected',            titleTh: 'ห้ามเปียกหรือมีคราบสกปรก' },
    { severity: 'warning', titleEn: 'Must be dry and not severely torn',            titleTh: 'ต้องแห้ง ไม่ฉีกขาดมาก' },
    { severity: 'info',    titleEn: 'Separate newspaper from magazines if possible', titleTh: 'แยกหนังสือพิมพ์จากนิตยสารได้ราคาดีกว่า' },
    { severity: 'info',    titleEn: 'Stack neatly and tie into bundles',            titleTh: 'เรียงกองและมัดเป็นฟ่อน ขายง่ายกว่า' },
  ],
  copper: [
    { severity: 'warning', titleEn: 'Strip plastic insulation from wire first',    titleTh: 'ปอกฉนวนพลาสติกออกจากสายไฟก่อน' },
    { severity: 'warning', titleEn: 'Heavily rusted copper earns less',            titleTh: 'ทองแดงสนิมมากได้ราคาต่ำกว่า' },
    { severity: 'info',    titleEn: 'Pure bare copper earns the highest price',    titleTh: 'ทองแดงเปลือยบริสุทธิ์ได้ราคาสูงสุด' },
    { severity: 'info',    titleEn: 'Sort by grade: bare > tinned > enamelled',    titleTh: 'แยกเกรด: เปลือย > ดีบุก > เคลือบน้ำยา' },
  ],
  glass: [
    { severity: 'reject',  titleEn: 'Badly cracked or shattered glass is rejected', titleTh: 'ห้ามแตกร้าวหรือแตกละเอียด' },
    { severity: 'warning', titleEn: 'Rinse out any remaining liquid',              titleTh: 'ล้างของเหลวค้างออกให้หมด' },
    { severity: 'info',    titleEn: 'Clear glass earns more than coloured glass',  titleTh: 'แก้วใสได้ราคาดีกว่าแก้วสี' },
    { severity: 'info',    titleEn: 'Sort by colour: clear > brown > green',       titleTh: 'แยกสี: ใส > น้ำตาล > เขียว ได้ราคาดีกว่า' },
  ],
  cooking_oil: [
    { severity: 'reject',  titleEn: 'Must be in sealed container — no water',      titleTh: 'บรรจุในภาชนะปิดสนิท ห้ามปนน้ำ' },
    { severity: 'reject',  titleEn: 'Engine oil and industrial oil not accepted',  titleTh: 'ห้ามปนน้ำมันเครื่องหรือน้ำมันอุตสาหกรรม' },
    { severity: 'warning', titleEn: 'Vegetable cooking oil only',                  titleTh: 'รับเฉพาะน้ำมันพืชที่ผ่านการทอดเท่านั้น' },
    { severity: 'info',    titleEn: 'Rancid smell is OK — still accepted',         titleTh: 'มีกลิ่นหืนได้ ยังรับซื้ออยู่' },
  ],
  mixed_plastic: [
    { severity: 'warning', titleEn: 'Rinse clean before selling',                  titleTh: 'ล้างสะอาดก่อนนำมาขาย' },
    { severity: 'info',    titleEn: 'Sort by resin type for better price',         titleTh: 'แยกประเภทพลาสติกได้ราคาดีกว่า' },
    { severity: 'info',    titleEn: 'PP (▲5) and HDPE (▲2) earn more than PVC (▲3)', titleTh: 'PP (▲5) และ HDPE (▲2) ราคาดีกว่า PVC (▲3)' },
    { severity: 'info',    titleEn: 'Remove metal parts and labels if possible',   titleTh: 'ถอดส่วนโลหะและฉลากออกได้ราคาดีกว่า' },
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
