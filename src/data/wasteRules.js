// Thai standard waste preparation rules (C-08)
// severity: reject=red, warning=amber, info=grey, dispose=blue
export const WASTE_RULES = {
  pet_bottle_clear: [
    { severity: 'reject',  titleEn: 'No liquid residue allowed',                    titleTh: 'ห้ามมีของเหลวเหลืออยู่' },
    { severity: 'warning', titleEn: 'Rinse, remove cap, crush flat',                titleTh: 'ล้างสะอาด ถอดฝา บีบแบน' },
    { severity: 'info',    titleEn: 'Label does not need to be removed',             titleTh: 'ฉลากไม่ต้องลอกออก' },
    { severity: 'info',    titleEn: 'Clear PET earns more than coloured PET',       titleTh: 'ขวด PET ใสได้ราคาดีกว่า PET สี' },
    { severity: 'dispose', titleEn: 'Dispose in yellow recycling bin or bring here', titleTh: 'ทิ้งในถังขยะสีเหลือง (รีไซเคิล) หรือนำมาขายโดยตรง' },
    { severity: 'dispose', titleEn: 'Never bin with general waste — takes 400+ yrs', titleTh: 'ห้ามทิ้งถังขยะทั่วไป — ใช้เวลาย่อยสลาย 400+ ปี' },
  ],
  aluminum_can: [
    { severity: 'info',    titleEn: 'Crush flat — no washing needed',               titleTh: 'บีบแบนได้ ไม่ต้องล้าง' },
    { severity: 'warning', titleEn: 'Separate from steel cans — steel earns less',  titleTh: 'แยกออกจากกระป๋องเหล็ก เหล็กราคาต่ำกว่า' },
    { severity: 'info',    titleEn: 'Pour out any remaining liquid first',          titleTh: 'เทของเหลวที่ค้างออกก่อนนำมาขาย' },
    { severity: 'dispose', titleEn: 'Dispose in yellow recycling bin',              titleTh: 'ทิ้งในถังขยะสีเหลือง (รีไซเคิล)' },
    { severity: 'dispose', titleEn: 'Aluminium recycles infinitely — never bin it', titleTh: 'อลูมิเนียมรีไซเคิลได้ไม่จำกัดรอบ — อย่าทิ้งถังทั่วไป' },
  ],
  cardboard: [
    { severity: 'reject',  titleEn: 'Wet or mouldy cardboard is rejected',          titleTh: 'ห้ามเปียกชื้นหรือขึ้นรา' },
    { severity: 'warning', titleEn: 'Remove tape, staples, and foam inserts',       titleTh: 'ลอกเทป ลวดเย็บ และโฟมออกก่อน' },
    { severity: 'info',    titleEn: 'Fold flat and bundle — easier to weigh',       titleTh: 'พับแบนมัดรวมกัน ชั่งน้ำหนักง่ายกว่า' },
    { severity: 'info',    titleEn: 'Remove stickers for better price',             titleTh: 'ลอกสติ๊กเกอร์ออกได้ราคาดีกว่า' },
    { severity: 'dispose', titleEn: 'Bundle and leave outside — collectors pick up', titleTh: 'มัดรวมวางหน้าบ้าน — ซาเล้งรับได้เลย' },
    { severity: 'dispose', titleEn: 'Wet cardboard cannot be recycled — keep dry',  titleTh: 'กระดาษเปียกรีไซเคิลไม่ได้ — เก็บในที่แห้ง' },
  ],
  newspaper: [
    { severity: 'reject',  titleEn: 'Wet or stained paper is rejected',             titleTh: 'ห้ามเปียกหรือมีคราบสกปรก' },
    { severity: 'warning', titleEn: 'Must be dry and not severely torn',             titleTh: 'ต้องแห้ง ไม่ฉีกขาดมาก' },
    { severity: 'info',    titleEn: 'Separate newspaper from magazines if possible', titleTh: 'แยกหนังสือพิมพ์จากนิตยสารได้ราคาดีกว่า' },
    { severity: 'info',    titleEn: 'Stack neatly and tie into bundles',             titleTh: 'เรียงกองและมัดเป็นฟ่อน ขายง่ายกว่า' },
    { severity: 'dispose', titleEn: 'Tie in bundles — leave for collectors or sell', titleTh: 'มัดเป็นฟ่อนวางให้ซาเล้งรับ หรือนำมาขายเอง' },
    { severity: 'dispose', titleEn: 'Yellow recycling bin if no collector nearby',   titleTh: 'หากไม่มีซาเล้ง ทิ้งถังขยะสีเหลืองได้เลย' },
  ],
  copper: [
    { severity: 'warning', titleEn: 'Strip plastic insulation from wire first',     titleTh: 'ปอกฉนวนพลาสติกออกจากสายไฟก่อน' },
    { severity: 'warning', titleEn: 'Heavily rusted copper earns less',             titleTh: 'ทองแดงสนิมมากได้ราคาต่ำกว่า' },
    { severity: 'info',    titleEn: 'Pure bare copper earns the highest price',     titleTh: 'ทองแดงเปลือยบริสุทธิ์ได้ราคาสูงสุด' },
    { severity: 'info',    titleEn: 'Sort by type: bare > tinned > enamelled',      titleTh: 'แยกประเภท: เปลือย > ดีบุก > เคลือบน้ำยา' },
    { severity: 'dispose', titleEn: 'Never bin — bring to a scrap metal shop only', titleTh: 'ห้ามทิ้งถังขยะ — นำไปร้านรับซื้อโลหะเท่านั้น' },
    { severity: 'dispose', titleEn: 'Landfilled copper is wasted — always recycle', titleTh: 'ทองแดงที่ฝังกลบคือทรัพยากรที่สูญเปล่า' },
  ],
  glass: [
    { severity: 'reject',  titleEn: 'Badly cracked or shattered glass is rejected', titleTh: 'ห้ามแตกร้าวหรือแตกละเอียด' },
    { severity: 'warning', titleEn: 'Rinse out any remaining liquid',               titleTh: 'ล้างของเหลวค้างออกให้หมด' },
    { severity: 'info',    titleEn: 'Clear glass earns more than coloured glass',   titleTh: 'แก้วใสได้ราคาดีกว่าแก้วสี' },
    { severity: 'info',    titleEn: 'Sort by colour: clear > brown > green',        titleTh: 'แยกสี: ใส > น้ำตาล > เขียว ได้ราคาดีกว่า' },
    { severity: 'dispose', titleEn: 'Use a glass bin or bring to a shop — do not smash first', titleTh: 'ทิ้งในถังขยะแก้ว — ห้ามทุบก่อนทิ้ง อันตรายต่อผู้เก็บ' },
    { severity: 'dispose', titleEn: 'Wrap broken glass in newspaper before binning', titleTh: 'แก้วแตกให้ห่อด้วยกระดาษหนังสือพิมพ์ก่อนทิ้ง' },
  ],
  cooking_oil: [
    { severity: 'reject',  titleEn: 'Must be in sealed container — no water',       titleTh: 'บรรจุในภาชนะปิดสนิท ห้ามปนน้ำ' },
    { severity: 'reject',  titleEn: 'Engine oil and industrial oil not accepted',   titleTh: 'ห้ามปนน้ำมันเครื่องหรือน้ำมันอุตสาหกรรม' },
    { severity: 'warning', titleEn: 'Vegetable cooking oil only',                   titleTh: 'รับเฉพาะน้ำมันพืชที่ผ่านการทอดเท่านั้น' },
    { severity: 'info',    titleEn: 'Rancid smell is OK — still accepted',          titleTh: 'มีกลิ่นหืนได้ ยังรับซื้ออยู่' },
    { severity: 'dispose', titleEn: 'Never pour down drains — blocks pipes & pollutes water', titleTh: 'ห้ามเทลงท่อน้ำ — อุดตันและปนเปื้อนแหล่งน้ำ' },
    { severity: 'dispose', titleEn: 'Seal in bottle → bring here or to oil collection point', titleTh: 'บรรจุขวดปิดฝา → นำมาขายหรือไปจุดรับน้ำมันใช้แล้ว' },
  ],
  mixed_plastic: [
    { severity: 'warning', titleEn: 'Rinse clean before selling',                   titleTh: 'ล้างสะอาดก่อนนำมาขาย' },
    { severity: 'info',    titleEn: 'Sort by resin type for better price',          titleTh: 'แยกประเภทพลาสติกได้ราคาดีกว่า' },
    { severity: 'info',    titleEn: 'PP (▲5) and HDPE (▲2) earn more than PVC (▲3)', titleTh: 'PP (▲5) และ HDPE (▲2) ราคาดีกว่า PVC (▲3)' },
    { severity: 'info',    titleEn: 'Remove metal parts and labels if possible',    titleTh: 'ถอดส่วนโลหะและฉลากออกได้ราคาดีกว่า' },
    { severity: 'dispose', titleEn: 'Dispose in yellow recycling bin',              titleTh: 'ทิ้งในถังขยะสีเหลือง (รีไซเคิล)' },
    { severity: 'dispose', titleEn: 'PVC (▲3) is hard to recycle — check local rules', titleTh: 'PVC (▲3) รีไซเคิลยาก — เช็กกฎพื้นที่ก่อนทิ้ง' },
  ],
}

export function getRulesFor(materialType) {
  return WASTE_RULES[materialType] ?? []
}

export const SEVERITY_COLOR = {
  reject:  'var(--orange)',
  warning: '#B8860B',
  info:    'var(--ink-3)',
  dispose: '#2563EB',
}
