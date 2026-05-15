// Local TM models served from public/model_ai/
// Stage 1: material type classifier (English folder name)
export const LOCAL_STAGE1_URL = '/model_ai/tm-my-image-model/model.json'

// YOLO stage 1 — exported from Waste-Classification-using-YOLOv8/best.pt
// Classes (index order from training): BIODEGRADABLE, CARDBOARD, GLASS, METAL, PAPER, PLASTIC
// Labels must match WASTE_ITEMS keys in src/data/wasteItems.js so pricePerKg() works.
// Index 0 stays 'ไม่ใช่ขยะ' — twoStageAI.js filters this string as a troll/non-recyclable signal.
export const LOCAL_YOLO_STAGE1_URL = '/model_ai/yolo_stage1.onnx'
export const LOCAL_YOLO_CLASS_LABELS = [
  'ไม่ใช่ขยะ',    // 0 BIODEGRADABLE — troll sentinel, do not change
  'cardboard',    // 1 CARDBOARD
  'glass',        // 2 GLASS
  'aluminum_can', // 3 METAL
  'newspaper',    // 4 PAPER
  'mixed_plastic',// 5 PLASTIC
]

// TM stage-1 labels — must match WASTE_ITEMS keys.
// 'ไม่ใช่ขยะ' kept as troll sentinel (twoStageAI.js line: materialType !== 'ไม่ใช่ขยะ').
export const LOCAL_STAGE1_LABELS = [
  'pet_bottle_clear', // ขวดน้ำ
  'aluminum_can',     // เหล็ก / อลูมิเนียม
  'newspaper',        // กระดาษ / หนังสือ
  'cardboard',        // กระดาษลัง
  'mixed_plastic',    // พลาสติก
  'glass',            // ขวดแก้ว
  'cooking_oil',      // น้ำมันเก่า
  'newspaper',        // หนังสือ (book paper → closest slug)
  'aluminum_can',     // อลูมิเนียม
  'ไม่ใช่ขยะ',        // เครื่องใช้ไฟฟ้าเสีย — e-waste not in WASTE_ITEMS, reject as non-recyclable
  'ไม่ใช่ขยะ',        // ไม่ใช่ขยะ — troll sentinel
]

// Stage 2 per-material cleanliness models.
// Keys must match WASTE_ITEMS slug keys (materialType from stage 1).
// Folder paths under public/model_ai/ keep their original Thai names.
export const LOCAL_STAGE2_URLS = {
  pet_bottle_clear: '/model_ai/ขวด/model.json',
  newspaper:        '/model_ai/กระดาษ/model.json',
  cardboard:        '/model_ai/ลัง/model.json',
  mixed_plastic:    '/model_ai/หลาสติก/model.json',
  glass:            '/model_ai/แก้ว/model.json',
  cooking_oil:      '/model_ai/น้ำมัน/model.json',
  aluminum_can:     '/model_ai/เหล็ก/model.json',
  // copper, copper → no cleanliness model → stage 2 auto-pass
}
