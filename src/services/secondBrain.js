// M-08: Second Brain — Claude API text-based waste classifier
// Fallback when ONNX is unavailable or low-confidence.
// Routes through the classify-waste Supabase Edge Function (keeps API key server-side).
// Falls back to mock classification if the function is unreachable.

import { supabase }   from '../lib/supabase'
import { WASTE_ITEMS } from '../data/wasteItems'

export const WASTE_MATERIALS = Object.keys(WASTE_ITEMS)

// Structured material catalogue — keeps prompt in sync with wasteItems.js
const MATERIAL_LINES = Object.entries(WASTE_ITEMS)
  .map(([key, v]) => `  ${key.padEnd(20)} — ${v.nameEn} (${v.nameTh})`)
  .join('\n')

export const DEFAULT_SYSTEM_PROMPT = [
  'You are WasteScan-AI, the waste classification engine for GreenPlus.Ai — a Thai recycling marketplace.',
  'Thai households and scrap shops use your output to sell recyclables at fair market prices.',
  'You receive a plain-text description of an item and return a structured classification.',
  '',
  '## ACCEPTED MATERIALS',
  'Use ONLY these exact materialType identifiers:',
  MATERIAL_LINES,
  '',
  '## GRADING CRITERIA',
  '  A — Clean, dry, uncontaminated, structurally intact. Full market value.',
  '  B — Slightly soiled, minor surface stains, small dents. Acceptable quality.',
  '  C — Heavily soiled, contaminated, broken, or mixed with foreign material.',
  '',
  '## WEIGHT ESTIMATION (estimatedWeight in kg)',
  '  Estimate based on the described quantity/size. Use typical unit weights:',
  '  • PET bottle: 0.01–0.05 kg  • Aluminum can: 0.01–0.02 kg',
  '  • Cardboard box: 0.3–2 kg   • Newspaper stack: 0.5–5 kg',
  '  • Copper wire coil: 0.2–5 kg • Glass bottle: 0.2–0.5 kg',
  '',
  '## CONFIDENCE CALIBRATION',
  '  0.90–1.0  — Single obvious material, clear condition, no ambiguity',
  '  0.70–0.89 — Confident but minor uncertainty (lighting, angle, similar items)',
  '  0.50–0.69 — Uncertain — description matches multiple materials',
  '  0.00–0.49 — Very uncertain — use this when the item is unclear or non-recyclable',
  '',
  '## OUTPUT FORMAT',
  'Return ONLY a valid JSON object. No markdown fences. No text outside the JSON.',
  'Schema: {"materialType":string,"grade":"A"|"B"|"C","estimatedWeight":number,"confidence":number,"explanation":string}',
  '',
  '## EXAMPLES',
  'Input: "3 clear empty plastic water bottles, clean and dry"',
  'Output: {"materialType":"pet_bottle_clear","grade":"A","estimatedWeight":0.08,"confidence":0.95,"explanation":"Clear PET bottles (ขวด PET ใส), clean and empty — Grade A."}',
  '',
  'Input: "old newspaper pile with some food stains"',
  'Output: {"materialType":"newspaper","grade":"C","estimatedWeight":1.5,"confidence":0.82,"explanation":"Newspaper (หนังสือพิมพ์) with food contamination — Grade C reduces value."}',
  '',
  'Input: "something metal, hard to tell what it is"',
  'Output: {"materialType":"aluminum_can","grade":"B","estimatedWeight":0.05,"confidence":0.35,"explanation":"Possibly metal — insufficient detail. Low confidence."}',
].join('\n')

const API_TIMEOUT_MS = 15_000
const EDGE_FN_URL    = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/classify-waste`

export async function classifyWaste(description, config = {}) {
  const {
    model               = 'claude-haiku-4-5-20251001',
    confidenceThreshold = 0.6,
  } = config

  if (model === 'mock') return mockClassify(description)

  // Require an active session — API key lives server-side in the Edge Function
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { ...mockClassify(description), source: 'mock-fallback' }

  const controller = new AbortController()
  const timeout    = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  const t0 = performance.now()
  try {
    const response = await fetch(EDGE_FN_URL, {
      method:  'POST',
      signal:  controller.signal,
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type':  'application/json',
      },
      // systemPrompt is hardcoded server-side; only description and model are sent
      body: JSON.stringify({ description, model }),
    })
    clearTimeout(timeout)

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`Edge Function ${response.status}: ${body.slice(0, 120)}`)
    }

    // Edge Function proxies the Anthropic response verbatim
    const data  = await response.json()
    const text  = data.content?.[0]?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON object in response')

    const json = JSON.parse(match[0])

    // Validate required keys before using the result
    const REQUIRED = ['materialType', 'grade', 'estimatedWeight', 'confidence', 'explanation']
    const missing  = REQUIRED.filter(k => json[k] === undefined)
    if (missing.length) throw new Error(`Response missing keys: ${missing.join(', ')}`)

    // Sanitise materialType — reject unknown categories
    if (!WASTE_MATERIALS.includes(json.materialType)) {
      console.warn('[SecondBrain] unknown materialType:', json.materialType, '— falling back to mock')
      return { ...mockClassify(description), source: 'mock-fallback' }
    }

    // Clamp numeric fields to valid ranges
    json.confidence      = Math.max(0, Math.min(1, Number(json.confidence) || 0))
    json.estimatedWeight = Math.max(0.01, Number(json.estimatedWeight) || 0.1)

    const ms = (performance.now() - t0).toFixed(0)
    console.info(`[SecondBrain] ${model} ${ms}ms conf=${json.confidence}`)

    return {
      ...json,
      source:        'claude',
      lowConfidence: (json.confidence ?? 0) < confidenceThreshold,
    }
  } catch (err) {
    clearTimeout(timeout)
    const isTimeout = err.name === 'AbortError'
    console.error('[SecondBrain]', isTimeout ? `timeout after ${API_TIMEOUT_MS}ms` : err.message)
    return { ...mockClassify(description), source: 'mock-fallback' }
  }
}

function mockClassify(description) {
  const lower = description.toLowerCase()
  let materialType = 'mixed_plastic'

  if      (lower.includes('glass')     || lower.includes('แก้ว'))          materialType = 'glass'
  else if (lower.includes('copper')    || lower.includes('ทองแดง'))         materialType = 'copper'
  else if (lower.includes('oil')       || lower.includes('น้ำมัน'))         materialType = 'cooking_oil'
  else if (lower.includes('can')       || lower.includes('กระป๋อง'))        materialType = 'aluminum_can'
  else if (lower.includes('cardboard') || lower.includes('กล่อง'))          materialType = 'cardboard'
  else if (lower.includes('paper')     || lower.includes('หนังสือพิมพ์'))   materialType = 'newspaper'
  else if (lower.includes('pet')       || lower.includes('bottle') || lower.includes('ขวด')) materialType = 'pet_bottle_clear'

  const score = 50 + Math.floor(Math.random() * 50)
  const grade = score >= 80 ? 'A' : score >= 50 ? 'B' : 'C'

  return {
    materialType,
    grade,
    estimatedWeight: +(0.1 + Math.random() * 0.9).toFixed(2),
    confidence:      +(0.6 + Math.random() * 0.35).toFixed(2),
    explanation:     `Detected ${materialType.replace(/_/g, ' ')} from keywords. Grade ${grade}.`,
    source:          'mock',
  }
}
