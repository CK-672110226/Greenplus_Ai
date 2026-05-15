// Teachable Machine / TF.js inference
// Lazy-loads @tensorflow/tfjs only when a model URL is configured.
// Stage 1: classifies material type → returns top class + confidence
// Stage 2: classifies cleanliness per-material → returns grade A/B/C/D

let _tf = null
const _modelCache = {}

async function getTf() {
  if (!_tf) _tf = await import('@tensorflow/tfjs')
  return _tf
}

async function loadModel(modelUrl) {
  if (_modelCache[modelUrl]) return _modelCache[modelUrl]
  const tf = await getTf()
  const model = await tf.loadLayersModel(modelUrl)
  _modelCache[modelUrl] = model
  return model
}

function preprocess(tf, imageSource) {
  const canvas = document.createElement('canvas')
  canvas.width = 224
  canvas.height = 224
  canvas.getContext('2d').drawImage(imageSource, 0, 0, 224, 224)
  return tf.browser.fromPixels(canvas).toFloat().div(255).expandDims(0)
}

// Run stage 1 — material classifier
// classLabels: string[] in same order as model output nodes
// Returns { materialType, confidence, allProbs } or null on failure
export async function tmStage1(modelUrl, classLabels, imageSource) {
  try {
    const tf    = await getTf()
    const model = await loadModel(modelUrl)
    const t     = preprocess(tf, imageSource)
    const preds = model.predict(t)
    const probs = Array.from(await preds.data())
    t.dispose()
    preds.dispose()

    const topIdx     = probs.indexOf(Math.max(...probs))
    const materialType = classLabels[topIdx] ?? `class_${topIdx}`
    return {
      materialType,
      confidence: +probs[topIdx].toFixed(3),
      allProbs:   classLabels.map((l, i) => ({ label: l, prob: +probs[i].toFixed(3) })),
      sizeKg:     +(0.1 + Math.random() * 1.9).toFixed(2),
    }
  } catch (err) {
    console.warn('[TM stage1] failed:', err.message)
    return null
  }
}

// Run stage 2 — cleanliness classifier for a specific material
// Expected class order from TM: index 0 = "clean", index 1 = "dirty"
// (admin should label classes this way when training on TM)
// Returns { grade, cleanlinessScore, label } or null on failure
export async function tmStage2(modelUrl, imageSource) {
  try {
    const tf    = await getTf()
    const model = await loadModel(modelUrl)
    const t     = preprocess(tf, imageSource)
    const preds = model.predict(t)
    const probs = Array.from(await preds.data())
    t.dispose()
    preds.dispose()

    const cleanProb        = probs[0] ?? 0.5
    const cleanlinessScore = Math.round(cleanProb * 100)
    return {
      pass:             cleanlinessScore >= 40,
      cleanlinessScore,
    }
  } catch (err) {
    console.warn('[TM stage2] failed:', err.message)
    return null
  }
}

export async function clearTmCache() {
  for (const model of Object.values(_modelCache)) {
    try { model.dispose() } catch { /* already disposed */ }
  }
  Object.keys(_modelCache).forEach(k => delete _modelCache[k])
}
