const WASTE_MATERIALS = [
  'pet_bottle_clear',
  'aluminum_can',
  'cardboard',
  'newspaper',
  'mixed_plastic',
  'copper',
  'glass',
  'cooking_oil',
]

const DEFAULT_SYSTEM_PROMPT = 'You are a waste classification AI for Thai recycling shops. Analyze waste items and return JSON with: materialType (one of: pet_bottle_clear/aluminum_can/cardboard/newspaper/mixed_plastic/copper/glass/cooking_oil), grade (A/B/C), estimatedWeight (kg), confidence (0-1), explanation.'

export async function classifyWaste(description, config = {}) {
  const {
    model = 'mock',
    apiKey = null,
    systemPrompt = DEFAULT_SYSTEM_PROMPT,
    confidenceThreshold = 0.7,
  } = config

  if (model === 'mock' || !apiKey) {
    return mockClassify(description)
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 512,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Classify this waste item: ${description}. Return JSON: { materialType, grade, estimatedWeight, confidence, explanation }`,
        }],
      }),
    })
    const data = await response.json()
    const text = data.content[0].text
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0])
    const confidence = json.confidence ?? 0
    if (confidence < confidenceThreshold) {
      return { ...json, source: 'claude', lowConfidence: true }
    }
    return { ...json, source: 'claude' }
  } catch (err) {
    console.error('Second Brain API error:', err)
    return mockClassify(description)
  }
}

function mockClassify(description) {
  const lower = description.toLowerCase()
  let materialType = 'mixed_plastic'

  if (lower.includes('glass') || lower.includes('แก้ว')) materialType = 'glass'
  else if (lower.includes('copper') || lower.includes('wire') || lower.includes('ทองแดง')) materialType = 'copper'
  else if (lower.includes('oil') || lower.includes('น้ำมัน')) materialType = 'cooking_oil'
  else if (lower.includes('can') || lower.includes('aluminum') || lower.includes('กระป๋อง')) materialType = 'aluminum_can'
  else if (lower.includes('cardboard') || lower.includes('box') || lower.includes('กล่อง')) materialType = 'cardboard'
  else if (lower.includes('paper') || lower.includes('newspaper') || lower.includes('หนังสือพิมพ์')) materialType = 'newspaper'
  else if (lower.includes('pet') || lower.includes('bottle') || lower.includes('ขวด')) materialType = 'pet_bottle_clear'

  const score = 50 + Math.floor(Math.random() * 50)
  const grade = score >= 80 ? 'A' : score >= 50 ? 'B' : 'C'

  return {
    materialType,
    grade,
    estimatedWeight: +(0.1 + Math.random() * 0.9).toFixed(2),
    confidence: +(0.6 + Math.random() * 0.35).toFixed(2),
    explanation: `Detected ${materialType.replace(/_/g, ' ')} based on description keywords. Grade ${grade} assigned.`,
    source: 'mock',
  }
}

export { WASTE_MATERIALS, DEFAULT_SYSTEM_PROMPT }
