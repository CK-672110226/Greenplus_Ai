// C-06: Two-stage waste AI pipeline
// Stage 1 — Material type + size estimation (from camera frame)
// Stage 2 — Cleanliness scoring → grade (A/B/C)
// Priority per stage: ONNX → Vertex AI → Mock fallback

import { WASTE_ITEMS } from '../data/wasteItems'
import { runOnnx, softmax } from './onnxInference'
import { vertexStage1, vertexStage2, imageToBase64 } from './vertexAI'

const MATERIALS = Object.keys(WASTE_ITEMS)

// ── Mock implementations ──────────────────────────────────────────

function mockStage1() {
  const isTroll    = Math.random() < 0.08
  if (isTroll) return { pass: false, troll: true }

  const materialType = MATERIALS[Math.floor(Math.random() * MATERIALS.length)]
  const confidence   = +(0.5 + Math.random() * 0.5).toFixed(2)
  const sizeKg       = +(0.1 + Math.random() * 1.9).toFixed(2)
  return { pass: true, materialType, confidence, sizeKg }
}

function mockStage2(materialType) {
  // Generate random factor scores 0-10
  const factors = {
    cleanliness: 3 + Math.random() * 7,
    moisture:    5 + Math.random() * 5,
    preparation: 4 + Math.random() * 6,
    color:       7 + Math.random() * 3,
    purity:      6 + Math.random() * 4,
  }

  // Weightings vary by material, simplified mock logic:
  let weightedScore
  if (materialType === 'pet_bottle_clear') {
    weightedScore = (factors.cleanliness * 0.3) + (factors.color * 0.25) + (factors.preparation * 0.25) + (factors.moisture * 0.2)
  } else if (materialType === 'cardboard') {
    weightedScore = (factors.moisture * 0.4) + (factors.preparation * 0.25) + (factors.purity * 0.2) + (factors.cleanliness * 0.15)
  } else {
    // generic fallback
    weightedScore = (factors.cleanliness * 0.4) + (factors.purity * 0.6)
  }

  weightedScore = Math.round(weightedScore * 10) // 0-100 scale

  const grade = weightedScore >= 80 ? 'A' : weightedScore >= 50 ? 'B' : 'C'
  const failReasons = weightedScore < 50 ? ['Item appears contaminated or damaged'] : []
  return { pass: factors.cleanliness >= 3, weightedScore, factorScores: factors, grade, failReasons }
}

// ── ONNX implementations ─────────────────────────────────────────

async function onnxStage1(imageSource, modelUrl) {
  const logits = await runOnnx(modelUrl, imageSource)
  if (!logits) return null

  const probs       = softmax(Array.from(logits))
  const topIdx      = probs.indexOf(Math.max(...probs))
  const materialType = MATERIALS[topIdx % MATERIALS.length]
  const confidence  = +probs[topIdx].toFixed(2)
  const sizeKg      = +(0.1 + Math.random() * 1.9).toFixed(2)
  return { pass: true, materialType, confidence, sizeKg }
}

// eslint-disable-next-line no-unused-vars
async function onnxStage2(imageSource, modelUrl, _materialType) {
  const logits = await runOnnx(modelUrl, imageSource)
  if (!logits) return null

  const probs = softmax(Array.from(logits.slice(0, 5)))

  // Mapping logits to generic factors for now
  const factorScores = {
    cleanliness: probs[0] * 10,
    moisture:    probs[1] * 10,
    preparation: probs[2] * 10,
    color:       probs[3] * 10,
    purity:      probs[4] * 10,
  }

  const weightedScore = Math.round(probs[0] * 100) // simplified for ONNX MVP
  const grade = weightedScore >= 80 ? 'A' : weightedScore >= 50 ? 'B' : 'C'
  return { pass: factorScores.cleanliness >= 3, weightedScore, factorScores, grade, failReasons: [] }
}

// ── Pipeline entry point ─────────────────────────────────────────

export async function twoStageInfer(imageSource, config = {}) {
  const {
    confidenceThreshold    = 0.6,
    onnxStage1Url          = null,
    onnxStage2Url          = null,
    vertexStage1Endpoint   = null,
    vertexStage2Endpoint   = null,
  } = config

  const b64 = imageToBase64(imageSource)

  // Stage 1
  const s1Raw = onnxStage1Url
    ? await onnxStage1(imageSource, onnxStage1Url)
    : vertexStage1Endpoint
      ? await vertexStage1(b64, vertexStage1Endpoint)
      : null
  const s1 = s1Raw ?? mockStage1()

  if (!s1.pass)           return { troll: true }
  if (s1.confidence < confidenceThreshold) {
    return { lowConfidence: true, confidence: s1.confidence, stage: 1 }
  }

  // Stage 2
  const s2Raw = onnxStage2Url
    ? await onnxStage2(imageSource, onnxStage2Url, s1.materialType)
    : vertexStage2Endpoint
      ? await vertexStage2(b64, vertexStage2Endpoint)
      : null
  const s2 = s2Raw ?? mockStage2(s1.materialType)

  const usedVertex = !onnxStage1Url && vertexStage1Endpoint && s1Raw
  const usedOnnx   = (onnxStage1Url && s1Raw) && (onnxStage2Url && s2Raw)

  return {
    materialType:    s1.materialType,
    confidence:      s1.confidence,
    weight:          s1.sizeKg,
    score:           s2.weightedScore,
    factorScores:    s2.factorScores,
    grade:           s2.grade,
    failReasons:     s2.failReasons,
    stage2Pass:      s2.pass,
    source:          usedOnnx ? 'onnx' : usedVertex ? 'vertex' : 'mock',
  }
}
