// Two-stage waste AI pipeline
// Stage 1 — Material type detection
//   Priority: YOLO (ONNX) → TM (TF.js) → ONNX classifier → Vertex AI
//   Returns { noDetection: true } when all models fail — no mock fallback
// Stage 2 — Cleanliness check (pass/fail), skipped when no model for that material
//   Priority: TM → ONNX → Vertex AI → skip (pass=true) if all fail

import { WASTE_ITEMS } from '../data/wasteItems'
import { runOnnx, softmax } from './onnxInference'
import { vertexStage1, vertexStage2, imageToBase64 } from './vertexAI'
import { tmStage1, tmStage2 } from './tmInference'
import { yoloStage1 } from './yoloInference'

const MATERIALS = Object.keys(WASTE_ITEMS)

// ── ONNX classifier fallback (not YOLO) ───────────────────────────

async function onnxClassifyStage1(imageSource, modelUrl) {
  const logits = await runOnnx(modelUrl, imageSource)
  if (!logits) return null
  const probs        = softmax(Array.from(logits))
  const topIdx       = probs.indexOf(Math.max(...probs))
  const materialType = MATERIALS[topIdx % MATERIALS.length]
  const confidence   = +probs[topIdx].toFixed(2)
  return { pass: true, materialType, confidence, sizeKg: +(0.1 + Math.random() * 1.9).toFixed(2) }
}

async function onnxStage2(imageSource, modelUrl) {
  const logits = await runOnnx(modelUrl, imageSource)
  if (!logits) return null
  const probs            = softmax(Array.from(logits.slice(0, 2)))
  const cleanlinessScore = Math.round(probs[0] * 100)
  return { pass: cleanlinessScore >= 40, cleanlinessScore }
}

// ── Stage-2 runner for a single YOLO detection ────────────────────
async function runStage2ForDet(det, config, imageSource, b64) {
  const { tmStage2Urls = {}, onnxStage2Url, vertexStage2Endpoint } = config
  const materialStage2Url = tmStage2Urls[det.materialType] ?? null

  if (!materialStage2Url && !onnxStage2Url && !vertexStage2Endpoint) {
    return { ...det, stage2Pass: true, stage2Skipped: true, cleanlinessScore: null }
  }

  let s2Raw = null
  if (materialStage2Url) {
    s2Raw = await tmStage2(materialStage2Url, imageSource)
  }
  if (!s2Raw && onnxStage2Url) {
    s2Raw = await onnxStage2(imageSource, onnxStage2Url)
  }
  if (!s2Raw && vertexStage2Endpoint) {
    s2Raw = await vertexStage2(b64, vertexStage2Endpoint)
  }
  const s2 = s2Raw ?? { pass: true }
  return { ...det, stage2Pass: s2.pass, cleanlinessScore: s2.cleanlinessScore ?? null }
}

// ── Pipeline entry point ──────────────────────────────────────────
// config shape:
//   yoloStage1Url        — ONNX YOLO model URL for stage 1 (highest priority)
//   yoloClassLabels      — string[] class labels matching YOLO output indices
//   tmStage1Url          — TF.js TM model.json URL for stage 1 (fallback)
//   stage1ClassLabels    — string[] for TM stage 1
//   tmStage2Urls         — { [materialType]: string } per-material TM cleanliness model
//   onnxStage1Url        — ONNX classifier fallback
//   onnxStage2Url        — ONNX cleanliness fallback
//   vertexStage1Endpoint — Vertex AI fallback
//   vertexStage2Endpoint — Vertex AI fallback
//   confidenceThreshold  — 0–1, default 0.6

export async function twoStageInfer(imageSource, config = {}) {
  const {
    confidenceThreshold   = 0.6,
    yoloStage1Url         = null,
    yoloClassLabels       = [],
    tmStage1Url           = null,
    stage1ClassLabels     = [],
    tmStage2Urls          = {},
    onnxStage1Url         = null,
    onnxStage2Url         = null,
    vertexStage1Endpoint  = null,
    vertexStage2Endpoint  = null,
  } = config

  const b64 = imageToBase64(imageSource)

  // ── Stage 1: material detection/classification ───────────────
  let aiSource = 'unknown'

  // 1a. YOLO (ONNX object detection) — returns array of all detections
  if (yoloStage1Url && yoloClassLabels.length > 0) {
    const yoloDets = await yoloStage1(yoloStage1Url, yoloClassLabels, imageSource)

    if (yoloDets.length > 0) {
      // Filter troll class and low-confidence before running stage 2
      const validDets = yoloDets
        .filter(d => d.materialType !== 'ไม่ใช่ขยะ')
        .filter(d => d.confidence >= confidenceThreshold)

      if (validDets.length === 0) {
        // All dets were troll or low-confidence
        const hasTroll = yoloDets.some(d => d.materialType === 'ไม่ใช่ขยะ')
        if (hasTroll) return { troll: true }
        return { lowConfidence: true, confidence: yoloDets[0].confidence, stage: 1 }
      }

      const stage2Config = { tmStage2Urls, onnxStage2Url, vertexStage2Endpoint }
      const results = await Promise.all(
        validDets.map(det => runStage2ForDet(det, stage2Config, imageSource, b64))
      )

      return {
        multiResult: results.map(r => ({
          materialType:    r.materialType,
          confidence:      r.confidence,
          weight:          r.sizeKg,
          bbox:            r.bbox ?? null,
          stage2Pass:      r.stage2Pass,
          stage2Skipped:   r.stage2Skipped ?? false,
          cleanlinessScore: r.cleanlinessScore ?? null,
          source:          'yolo',
        })),
      }
    }
    // Empty array — YOLO ran but found nothing; fall through to other models
  }

  // 1b. TM (Teachable Machine classifier) — labels read from metadata.json, no need for classLabels
  let s1Raw    = null
  if (tmStage1Url) {
    s1Raw = await tmStage1(tmStage1Url, stage1ClassLabels, imageSource)
    if (s1Raw) aiSource = 'tfjs'
  }

  // 1c. ONNX classifier fallback
  if (!s1Raw && onnxStage1Url) {
    s1Raw = await onnxClassifyStage1(imageSource, onnxStage1Url)
    if (s1Raw) aiSource = 'onnx'
  }

  // 1d. Vertex AI fallback
  if (!s1Raw && vertexStage1Endpoint) {
    s1Raw = await vertexStage1(b64, vertexStage1Endpoint)
    if (s1Raw) aiSource = 'vertex'
  }

  // No real model produced a result — hard stop, no mock fallback
  if (!s1Raw) return { noDetection: true }

  // Mark ไม่ใช่ขยะ as troll
  if (!('pass' in s1Raw)) {
    s1Raw.pass = s1Raw.materialType !== 'ไม่ใช่ขยะ'
  }
  const s1 = s1Raw

  if (!s1.pass)                            return { troll: true }
  if (s1.confidence < confidenceThreshold) return { lowConfidence: true, confidence: s1.confidence, stage: 1 }

  // ── Stage 2: per-material cleanliness check ──────────────────
  const materialStage2Url = tmStage2Urls[s1.materialType] ?? null

  if (!materialStage2Url && !onnxStage2Url && !vertexStage2Endpoint) {
    return {
      materialType:    s1.materialType,
      confidence:      s1.confidence,
      weight:          s1.sizeKg,
      bbox:            s1.bbox ?? null,
      stage2Pass:      true,
      stage2Skipped:   true,
      cleanlinessScore: null,
      source:          aiSource,
    }
  }

  let s2Raw = null
  if (materialStage2Url) {
    s2Raw = await tmStage2(materialStage2Url, imageSource)
  }
  if (!s2Raw && onnxStage2Url) {
    s2Raw = await onnxStage2(imageSource, onnxStage2Url)
  }
  if (!s2Raw && vertexStage2Endpoint) {
    s2Raw = await vertexStage2(b64, vertexStage2Endpoint)
  }
  // Stage 2 model configured but all failed — skip cleanliness check gracefully
  const s2 = s2Raw ?? { pass: true }

  return {
    materialType:    s1.materialType,
    confidence:      s1.confidence,
    weight:          s1.sizeKg,
    bbox:            s1.bbox ?? null,
    stage2Pass:      s2.pass,
    cleanlinessScore: s2.cleanlinessScore ?? null,
    source:          aiSource,
  }
}
