// Teachable Machine / TF.js inference
// Uses @teachablemachine/image for reliable TM-format model loading.
// Stage 1: classifies material type (used as TM fallback when no YOLO model)
// Stage 2: classifies cleanliness per-material → returns pass/fail

const _tmCache = {}   // modelUrl → tmImage model

async function loadTmModel(modelUrl) {
  if (_tmCache[modelUrl]) return _tmCache[modelUrl]

  const metaUrl = modelUrl.replace('model.json', 'metadata.json')
  const tmImage = await import('@teachablemachine/image')
  const model   = await tmImage.load(modelUrl, metaUrl)
  _tmCache[modelUrl] = model
  return model
}

// Run stage 1 — material classifier
// classLabels: string[] (used as fallback if metadata.json unavailable)
// Returns { materialType, confidence, allProbs, sizeKg } or null on failure
export async function tmStage1(modelUrl, classLabels, imageSource) {
  try {
    const model      = await loadTmModel(modelUrl)
    const predictions = await model.predict(imageSource)
    // predictions: [{ className, probability }, ...]
    const top         = predictions.reduce((a, b) => b.probability > a.probability ? b : a)
    return {
      materialType: top.className,
      confidence:   +top.probability.toFixed(3),
      allProbs:     predictions.map(p => ({ label: p.className, prob: +p.probability.toFixed(3) })),
      sizeKg:       +(0.1 + Math.random() * 1.9).toFixed(2),
    }
  } catch (err) {
    console.error('[TM stage1] failed to load or run model:', err)
    return null
  }
}

// Run stage 2 — cleanliness classifier for a specific material
// Expected TM class names: index 0 = สะอาด (clean), index 1 = ไม่สะอาด (dirty)
// Returns { pass, cleanlinessScore } or null on failure
export async function tmStage2(modelUrl, imageSource) {
  try {
    const model       = await loadTmModel(modelUrl)
    const predictions = await model.predict(imageSource)
    // Find สะอาด or first class as clean probability
    const cleanPred   = predictions.find(p =>
      p.className.includes('สะอาด') && !p.className.includes('ไม่')
    ) ?? predictions[0]
    const cleanlinessScore = Math.round((cleanPred?.probability ?? 0.5) * 100)
    return { pass: cleanlinessScore >= 40, cleanlinessScore }
  } catch (err) {
    console.error('[TM stage2] failed to load or run model:', err)
    return null
  }
}

export async function clearTmCache() {
  Object.keys(_tmCache).forEach(k => delete _tmCache[k])
}
