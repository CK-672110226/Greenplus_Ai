// Waste AI pipeline — Stage 1 material detection only
// Priority: YOLO (ONNX) → TM (TF.js) → ONNX classifier
// Returns { noDetection: true } when all models fail — no mock fallback

import { WASTE_ITEMS } from '../data/wasteItems'
import { runOnnx, softmax } from './onnxInference'
import { tmStage1 } from './tmInference'
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

// ── Pipeline entry point ──────────────────────────────────────────
// config shape:
//   yoloStage1Url     — ONNX YOLO model URL for stage 1 (highest priority)
//   yoloClassLabels   — string[] class labels matching YOLO output indices
//   tmStage1Url       — TF.js TM model.json URL for stage 1 (fallback)
//   stage1ClassLabels — string[] for TM stage 1
//   onnxStage1Url     — ONNX classifier fallback
//   confidenceThreshold — 0–1, default 0.6

export async function twoStageInfer(imageSource, config = {}) {
  const {
    confidenceThreshold = 0.6,
    yoloStage1Url       = null,
    yoloClassLabels     = [],
    tmStage1Url         = null,
    stage1ClassLabels   = [],
    onnxStage1Url       = null,
  } = config

  // ── Stage 1: material detection/classification ───────────────
  let aiSource = 'unknown'

  // 1a. YOLO (ONNX object detection) — returns array of all detections
  if (yoloStage1Url && yoloClassLabels.length > 0) {
    const yoloDets = await yoloStage1(yoloStage1Url, yoloClassLabels, imageSource)

    if (yoloDets.length > 0) {
      // Filter troll class and low-confidence detections
      const validDets = yoloDets
        .filter(d => d.materialType !== 'ไม่ใช่ขยะ')
        .filter(d => d.confidence >= confidenceThreshold)

      if (validDets.length === 0) {
        // All dets were troll or low-confidence
        const hasTroll = yoloDets.some(d => d.materialType === 'ไม่ใช่ขยะ')
        if (hasTroll) return { troll: true }
        return { lowConfidence: true, confidence: yoloDets[0].confidence, stage: 1 }
      }

      return {
        multiResult: validDets.map(r => ({
          materialType: r.materialType,
          confidence:   r.confidence,
          weight:       r.sizeKg,
          bbox:         r.bbox ?? null,
          source:       'yolo',
        })),
      }
    }
    // Empty array — YOLO ran but found nothing; fall through to other models
  }

  // 1b. TM (Teachable Machine classifier) — labels read from metadata.json
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

  // No real model produced a result — hard stop, no mock fallback
  if (!s1Raw) return { noDetection: true }

  // Mark ไม่ใช่ขยะ as troll
  if (!('pass' in s1Raw)) {
    s1Raw.pass = s1Raw.materialType !== 'ไม่ใช่ขยะ'
  }
  const s1 = s1Raw

  if (!s1.pass)                            return { troll: true }
  if (s1.confidence < confidenceThreshold) return { lowConfidence: true, confidence: s1.confidence, stage: 1 }

  return {
    materialType: s1.materialType,
    confidence:   s1.confidence,
    weight:       s1.sizeKg,
    bbox:         s1.bbox ?? null,
    source:       aiSource,
  }
}
