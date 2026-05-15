// YOLO ONNX stage-1 pipeline — material type detection
// Supports YOLOv5 output  [1, num_pred, 5+nc]  and
//          YOLOv8 output  [1, 4+nc, num_pred]
// Returns { materialType, confidence, bbox: {x1,y1,x2,y2}, sizeKg } or null on failure

const YOLO_INPUT_SIZE = 640
const CONF_THRESH     = 0.30
const IOU_THRESH      = 0.45

// ── Preprocessing ────────────────────────────────────────────────
// Letterbox to YOLO_INPUT_SIZE × YOLO_INPUT_SIZE, [0,1] normalised, NCHW float32
function preprocessYolo(source) {
  const canvas = document.createElement('canvas')
  canvas.width  = YOLO_INPUT_SIZE
  canvas.height = YOLO_INPUT_SIZE
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, YOLO_INPUT_SIZE, YOLO_INPUT_SIZE)

  const sw = source.videoWidth  || source.naturalWidth  || source.width  || YOLO_INPUT_SIZE
  const sh = source.videoHeight || source.naturalHeight || source.height || YOLO_INPUT_SIZE
  const scale  = Math.min(YOLO_INPUT_SIZE / sw, YOLO_INPUT_SIZE / sh)
  const newW   = Math.round(sw * scale)
  const newH   = Math.round(sh * scale)
  const padX   = Math.round((YOLO_INPUT_SIZE - newW) / 2)
  const padY   = Math.round((YOLO_INPUT_SIZE - newH) / 2)
  ctx.drawImage(source, padX, padY, newW, newH)

  const { data } = ctx.getImageData(0, 0, YOLO_INPUT_SIZE, YOLO_INPUT_SIZE)
  const float32  = new Float32Array(3 * YOLO_INPUT_SIZE * YOLO_INPUT_SIZE)
  const n = YOLO_INPUT_SIZE * YOLO_INPUT_SIZE
  for (let i = 0; i < n; i++) {
    float32[i]         = data[i * 4]     / 255
    float32[i + n]     = data[i * 4 + 1] / 255
    float32[i + 2 * n] = data[i * 4 + 2] / 255
  }
  return { float32, padX, padY, scale }
}

// ── NMS ──────────────────────────────────────────────────────────
function iou(a, b) {
  const x1 = Math.max(a.x1, b.x1), y1 = Math.max(a.y1, b.y1)
  const x2 = Math.min(a.x2, b.x2), y2 = Math.min(a.y2, b.y2)
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1)
  const areaA = (a.x2 - a.x1) * (a.y2 - a.y1)
  const areaB = (b.x2 - b.x1) * (b.y2 - b.y1)
  return inter / (areaA + areaB - inter + 1e-6)
}

function nms(dets) {
  dets.sort((a, b) => b.score - a.score)
  const kept = []
  const suppressed = new Set()
  for (let i = 0; i < dets.length; i++) {
    if (suppressed.has(i)) continue
    kept.push(dets[i])
    for (let j = i + 1; j < dets.length; j++) {
      if (!suppressed.has(j) && iou(dets[i], dets[j]) > IOU_THRESH) suppressed.add(j)
    }
  }
  return kept
}

// ── Output parsing ────────────────────────────────────────────────
// classLabels: string[] matching model output class indices
function parseYolo(rawData, shape, classLabels, padX, padY, scale) {
  const nc         = classLabels.length
  const [, d0, d1] = shape   // shape is [1, ?, ?]

  // YOLOv8: [1, 4+nc, num_anchors] — d0 is attr count, d1 is anchor count
  // YOLOv5: [1, num_pred, 5+nc]    — d0 is anchor count, d1 is attr count
  const isV8 = d0 === (4 + nc)
  const isV5 = d1 === (5 + nc)

  if (!isV8 && !isV5) {
    console.warn('[YOLO] unexpected output shape', shape.length, shape)
    return []
  }

  const numAnchors = isV8 ? d1 : d0
  const S          = d1   // raw stride: anchors for V8, attrs for V5

  const dets = []
  for (let i = 0; i < numAnchors; i++) {
    let cx, cy, w, h, objectness, classStart
    if (isV8) {
      // shape [1, 4+nc, num_anchors] — columns are anchors
      cx = rawData[0 * S + i]
      cy = rawData[1 * S + i]
      w  = rawData[2 * S + i]
      h  = rawData[3 * S + i]
      objectness = 1
      classStart = (idx) => rawData[(4 + idx) * S + i]
    } else {
      // shape [1, num_pred, 5+nc] — rows are anchors
      const base = i * S
      cx = rawData[base]
      cy = rawData[base + 1]
      w  = rawData[base + 2]
      h  = rawData[base + 3]
      objectness = rawData[base + 4]
      classStart = (idx) => rawData[base + 5 + idx]
    }

    if (objectness < CONF_THRESH) continue

    let bestClass = 0, bestProb = 0
    for (let c = 0; c < nc; c++) {
      const p = classStart(c)
      if (p > bestProb) { bestProb = p; bestClass = c }
    }
    const score = objectness * bestProb
    if (score < CONF_THRESH) continue

    // Convert cx,cy,w,h (in 640-space) back to original image space
    const x1Pad = (cx - w / 2)
    const y1Pad = (cy - h / 2)
    const x1 = (x1Pad - padX) / scale
    const y1 = (y1Pad - padY) / scale
    const x2 = (x1Pad + w - padX) / scale
    const y2 = (y1Pad + h - padY) / scale

    dets.push({ x1, y1, x2, y2, score, classIdx: bestClass })
  }

  return nms(dets).map(d => ({
    materialType: classLabels[d.classIdx] ?? `class_${d.classIdx}`,
    confidence:   +d.score.toFixed(3),
    bbox:         { x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2 },
    sizeKg:       +(((d.x2 - d.x1) * (d.y2 - d.y1)) / 90000 * 2).toFixed(2),
  }))
}

// ── Entry point ───────────────────────────────────────────────────
// Returns Array<{ materialType, confidence, bbox, sizeKg }> — empty on failure or no detection
export async function yoloStage1(modelUrl, classLabels, imageSource) {
  try {
    const { Tensor, InferenceSession } = await import('onnxruntime-web')
    const session = await InferenceSession.create(modelUrl)

    const { float32, padX, padY, scale } = preprocessYolo(imageSource)
    const inputName = session.inputNames[0]
    const tensor    = new Tensor('float32', float32, [1, 3, YOLO_INPUT_SIZE, YOLO_INPUT_SIZE])

    const output     = await session.run({ [inputName]: tensor })
    const outTensor  = output[session.outputNames[0]]
    const rawData    = Array.from(outTensor.data)
    const shape      = outTensor.dims

    const dets = parseYolo(rawData, shape, classLabels, padX, padY, scale)
    if (!dets.length) {
      console.info('[YOLO] no detections above threshold')
      return []
    }
    console.info('[YOLO] detections:', dets.length, dets.map(d => `${d.materialType}(${d.confidence})`).join(', '))
    return dets
  } catch (err) {
    console.warn('[YOLO] inference failed:', err.message)
    return []
  }
}
