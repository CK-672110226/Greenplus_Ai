// Local TM models served from public/model_ai/
// Stage 1: material type classifier (English folder name)
export const LOCAL_STAGE1_URL = '/model_ai/tm-my-image-model/model.json'

export const LOCAL_STAGE1_LABELS = [
  'ขวดน้ำ', 'เหล็ก', 'กระดาษ', 'กระดาษลัง',
  'พลาสติก', 'ขวดแก้ว', 'น้ำมันเก่า', 'หนังสือ',
  'อลูมิเนียม', 'เครื่องใช้ไฟฟ้าเสีย', 'ไม่ใช่ขยะ',
]

// Stage 2: per-material cleanliness check (Thai folder names)
// materialType label from stage 1 → model URL (null = skip stage 2, auto-pass)
export const LOCAL_STAGE2_URLS = {
  'ขวดน้ำ':    '/model_ai/ขวด/model.json',
  'กระดาษ':    '/model_ai/กระดาษ/model.json',
  'กระดาษลัง': '/model_ai/ลัง/model.json',
  'พลาสติก':   '/model_ai/หลาสติก/model.json',
  'ขวดแก้ว':   '/model_ai/แก้ว/model.json',
  'น้ำมันเก่า': '/model_ai/น้ำมัน/model.json',
  'เหล็ก':     '/model_ai/เหล็ก/model.json',
  // หนังสือ, อลูมิเนียม, เครื่องใช้ไฟฟ้าเสีย → no model → stage 2 skipped (auto-pass)
}
