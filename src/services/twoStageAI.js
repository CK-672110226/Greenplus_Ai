// C-06: Two-stage waste AI pipeline
// Stage 1 — Material type + size estimation (from camera frame)
// Stage 2 — Cleanliness scoring → grade (A/B/C/D), per-material model
// Priority per stage: TF.js (TM) → ONNX → Vertex AI → Mock fallback

import { WASTE_ITEMS } from '../data/wasteItems'
import { runOnnx, softmax } from './onnxInference'
import { vertexStage1, vertexStage2, imageToBase64 } from './vertexAI'
import { tmStage1, tmStage2 } from './tmInference'
import { yoloStage1 } from './yoloAPI'

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
  const factors = {
    cleanliness: 3 + Math.random() * 7,
    moisture:    5 + Math.random() * 5,
    preparation: 4 + Math.random() * 6,
    color:       7 + Math.random() * 3,
    purity:      6 + Math.random() * 4,
  }

  let weightedScore
  if (materialType === 'pet_bottle_clear') {
    weightedScore = (factors.cleanliness * 0.3) + (factors.color * 0.25) + (factors.preparation * 0.25) + (factors.moisture * 0.2)
  } else if (materialType === 'cardboard') {
    weightedScore = (factors.moisture * 0.4) + (factors.preparation * 0.25) + (factors.purity * 0.2) + (factors.cleanliness * 0.15)
  } else {
    weightedScore = (factors.cleanliness * 0.4) + (factors.purity * 0.6)
  }

  weightedScore = Math.round(weightedScore * 10)

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

  const factorScores = {
    cleanliness: probs[0] * 10,
    moisture:    probs[1] * 10,
    preparation: probs[2] * 10,
    color:       probs[3] * 10,
    purity:      probs[4] * 10,
  }

  const weightedScore = Math.round(probs[0] * 100)
  const grade = weightedScore >= 80 ? 'A' : weightedScore >= 50 ? 'B' : 'C'
  return { pass: factorScores.cleanliness >= 3, weightedScore, factorScores, grade, failReasons: [] }
}

// ── Pipeline entry point ─────────────────────────────────────────
// config shape:
//   tmStage1Url          — TF.js model.json URL for material classifier
//   stage1ClassLabels    — string[] matching TM output nodes for stage1
//   tmStage2Urls         — { [materialType: string]: string } per-material cleanliness model URLs
//   onnxStage1Url        — ONNX fallback for stage1
//   onnxStage2Url        — ONNX fallback for stage2 (global, used if no per-material TM model)
//   vertexStage1Endpoint — Vertex AI fallback
//   vertexStage2Endpoint — Vertex AI fallback
//   confidenceThreshold  — 0–1, default 0.6

export async function twoStageInfer(imageSource, config = {}) {
  const {
    confidenceThreshold    = 0.6,
    yoloEndpoint           = null,
    tmStage1Url            = null,
    stage1ClassLabels      = [],
    tmStage2Urls           = {},
    onnxStage1Url          = null,
    onnxStage2Url          = null,
    vertexStage1Endpoint   = null,
    vertexStage2Endpoint   = null,
  } = config

  const b64 = imageToBase64(imageSource)

  // ── Stage 1: material classifier ────────────────────────────
  // Priority: YOLO → TF.js (TM) → ONNX → Vertex AI → Mock
  let s1Raw = null
  let aiSource = 'mock'

  if (yoloEndpoint) {
    s1Raw = await yoloStage1(imageSource, yoloEndpoint)
    if (s1Raw) aiSource = 'yolo'
  }
  if (!s1Raw && tmStage1Url && stage1ClassLabels.length > 0) {
    s1Raw = await tmStage1(tmStage1Url, stage1ClassLabels, imageSource)
    if (s1Raw) aiSource = 'tfjs'
  }
  if (!s1Raw && onnxStage1Url) {
    s1Raw = await onnxStage1(imageSource, onnxStage1Url)
    if (s1Raw) aiSource = 'onnx'
  }
  if (!s1Raw && vertexStage1Endpoint) {
    s1Raw = await vertexStage1(b64, vertexStage1Endpoint)
    if (s1Raw) aiSource = 'vertex'
  }
  const s1 = s1Raw ?? mockStage1()

  if (!s1.pass)                              return { troll: true }
  if (s1.confidence < confidenceThreshold)   return { lowConfidence: true, confidence: s1.confidence, stage: 1 }

  // ── Stage 2: per-material cleanliness classifier ─────────────
  let s2Raw = null

  // Try per-material TM model first
  const materialStage2Url = tmStage2Urls[s1.materialType] ?? null
  if (materialStage2Url) {
    s2Raw = await tmStage2(materialStage2Url, imageSource)
  }
  // Fall back to global ONNX stage2
  if (!s2Raw && onnxStage2Url) {
    s2Raw = await onnxStage2(imageSource, onnxStage2Url, s1.materialType)
  }
  // Fall back to Vertex AI
  if (!s2Raw && vertexStage2Endpoint) {
    s2Raw = await vertexStage2(b64, vertexStage2Endpoint)
  }
  const s2 = s2Raw ?? mockStage2(s1.materialType)

  return {
    materialType: s1.materialType,
    confidence:   s1.confidence,
    weight:       s1.sizeKg,
    score:        s2.weightedScore,
    factorScores: s2.factorScores,
    grade:        s2.grade,
    failReasons:  s2.failReasons,
    stage2Pass:   s2.pass,
    source:       aiSource,
  }
}
