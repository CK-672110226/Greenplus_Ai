// C-12: ONNX model inference framework
// Uses onnxruntime-web when a model URL is configured, otherwise returns null
// so the caller can fall back to mock inference.

let _sessionCache = {}

async function loadSession(modelUrl) {
  if (_sessionCache[modelUrl]) return _sessionCache[modelUrl]
  const { InferenceSession } = await import('onnxruntime-web')
  const session = await InferenceSession.create(modelUrl)
  _sessionCache[modelUrl] = session
  return session
}

// Release ONNX WASM memory when the admin deploys a new model URL.
export async function clearModelCache() {
  for (const session of Object.values(_sessionCache)) {
    try { await session.release() } catch { /* already released */ }
  }
  _sessionCache = {}
}

// Preprocess a <canvas> or ImageData into a Float32 NCHW tensor [1, 3, 224, 224]
function preprocessImage(source) {
  const canvas = document.createElement('canvas')
  canvas.width = 224; canvas.height = 224
  const ctx = canvas.getContext('2d')
  ctx.drawImage(source, 0, 0, 224, 224)
  const { data } = ctx.getImageData(0, 0, 224, 224)
  const float32 = new Float32Array(3 * 224 * 224)
  const mean = [0.485, 0.456, 0.406]
  const std  = [0.229, 0.224, 0.225]
  for (let i = 0; i < 224 * 224; i++) {
    float32[i]               = (data[i * 4]     / 255 - mean[0]) / std[0]
    float32[i + 224 * 224]   = (data[i * 4 + 1] / 255 - mean[1]) / std[1]
    float32[i + 2 * 224 * 224] = (data[i * 4 + 2] / 255 - mean[2]) / std[2]
  }
  return float32
}

// Run inference on a model URL. Returns Float32Array of logits, or null on failure.
export async function runOnnx(modelUrl, imageSource) {
  const t0 = performance.now()
  try {
    const { Tensor } = await import('onnxruntime-web')
    const session   = await loadSession(modelUrl)
    const inputData = preprocessImage(imageSource)
    const inputName = session.inputNames[0]
    const tensor    = new Tensor('float32', inputData, [1, 3, 224, 224])
    const output    = await session.run({ [inputName]: tensor })
    const ms = (performance.now() - t0).toFixed(1)
    console.info(`[ONNX] inference ${ms}ms`)
    return output[session.outputNames[0]].data
  } catch (err) {
    console.warn('[ONNX] inference failed, falling back to mock:', err.message)
    return null
  }
}

// Softmax — loop-based to avoid call stack overflow on large ONNX output tensors.
export function softmax(logits) {
  let max = -Infinity
  for (let i = 0; i < logits.length; i++) { if (logits[i] > max) max = logits[i] }
  let sum = 0
  const exps = new Float64Array(logits.length)
  for (let i = 0; i < logits.length; i++) { exps[i] = Math.exp(logits[i] - max); sum += exps[i] }
  const probs = new Array(logits.length)
  for (let i = 0; i < logits.length; i++) { probs[i] = exps[i] / sum }
  return probs
}
