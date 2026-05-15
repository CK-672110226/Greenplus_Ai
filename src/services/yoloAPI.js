// yoloAPI.js — calls the GreenPlus YOLO FastAPI backend
// Returns a Stage 1 result compatible with twoStageAI.js:
//   { pass, materialType, confidence, sizeKg }   on success
//   null                                          on network / server error

import { imageToBase64 } from './vertexAI'

/**
 * POST the image to the YOLO server and return a Stage 1 result.
 * @param {HTMLVideoElement|HTMLImageElement} imageSource
 * @param {string} endpoint  e.g. "http://localhost:8000"
 * @returns {Promise<{pass:boolean, materialType:string, confidence:number, sizeKg:number}|null>}
 */
export async function yoloStage1(imageSource, endpoint) {
  try {
    const b64 = imageToBase64(imageSource)

    const res = await fetch(`${endpoint.replace(/\/$/, '')}/infer`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ image: b64 }),
    })

    if (!res.ok) return null

    const data = await res.json()

    // Server returns pass_ (Python reserved word workaround)
    if (!data.pass_) return { pass: false, troll: true }

    return {
      pass:         true,
      materialType: data.material_type,
      confidence:   data.confidence,
      sizeKg:       data.size_kg,
      bbox:         data.bbox ?? null,   // { x1, y1, x2, y2 } – forwarded to ScanPage
    }
  } catch {
    return null   // network error → fall through to next provider
  }
}
