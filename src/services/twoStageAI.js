// C-06: Two-stage waste AI pipeline
// Stage 1 — Material type + size estimation (from camera frame)
// Stage 2 — Cleanliness scoring → grade (A/B/C)
// Each stage tries ONNX first, falls back to mock if no model URL or inference fails.

import { WASTE_ITEMS } from '../data/wasteItems'
import { runOnnx, softmax } from './onnxInference'

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

function mockStage2() {
  const score      = 20 + Math.floor(Math.random() * 81)
  const grade      = score >= 80 ? 'A' : score >= 50 ? 'B' : 'C'
  const failReasons = score < 50 ? ['Item appears contaminated or damaged'] : []
  return { pass: score >= 30, cleanlinessScore: score, grade, failReasons }
}

// ── ONNX implementations ─────────────────────────────────────────

async function onnxStage1(imageSource, modelUrl) {
  const logits = await runOnnx(modelUrl, imageSource)
  if (!logits || logits.length < MATERIALS.length) return null

  const probs = softmax(Array.from(logits.slice(0, MATERIALS.length)))
  let topIdx = 0
  for (let i = 1; i < probs.length; i++) { if (probs[i] > probs[topIdx]) topIdx = i }
  const materialType = MATERIALS[topIdx]
  const confidence   = +probs[topIdx].toFixed(2)
  const sizeKg       = +(0.1 + Math.random() * 1.9).toFixed(2)
  return { pass: true, materialType, confidence, sizeKg }
}

async function onnxStage2(imageSource, modelUrl) {
  const logits = await runOnnx(modelUrl, imageSource)
  if (!logits || logits.length < 1) return null

  const probs            = softmax(Array.from(logits.slice(0, 2)))
  const cleanlinessScore = Math.round(probs[0] * 100)
  const grade            = cleanlinessScore >= 80 ? 'A' : cleanlinessScore >= 50 ? 'B' : 'C'
  return { pass: cleanlinessScore >= 30, cleanlinessScore, grade, failReasons: [] }
}

// ── Pipeline entry point ─────────────────────────────────────────

export async function twoStageInfer(imageSource, config = {}) {
  const {
    confidenceThreshold = 0.6,
    onnxStage1Url       = null,
    onnxStage2Url       = null,
  } = config

  // Stage 1
  const s1Raw = onnxStage1Url
    ? await onnxStage1(imageSource, onnxStage1Url)
    : null
  const s1 = s1Raw ?? mockStage1()

  if (!s1.pass)           return { troll: true }
  if (s1.confidence < confidenceThreshold) {
    return { lowConfidence: true, confidence: s1.confidence, stage: 1 }
  }

  // Stage 2
  const s2Raw = onnxStage2Url
    ? await onnxStage2(imageSource, onnxStage2Url)
    : null
  const s2 = s2Raw ?? mockStage2()

  const source = s1Raw
    ? (s2Raw ? 'onnx'         : 'onnx+mock')
    : (s2Raw ? 'mock+onnx'    : 'mock')

  return {
    materialType:    s1.materialType,
    confidence:      s1.confidence,
    weight:          s1.sizeKg,
    score:           s2.cleanlinessScore,
    grade:           s2.grade,
    failReasons:     s2.failReasons,
    stage2Pass:      s2.pass,
    source,
  }
}
