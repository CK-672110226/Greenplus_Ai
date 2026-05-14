// Vertex AI AutoML prediction service
// Env vars required:
//   VITE_VERTEX_PROJECT_ID   — GCP project ID
//   VITE_VERTEX_LOCATION     — e.g. us-central1
//   VITE_VERTEX_ACCESS_TOKEN — short-lived OAuth2 token (IAM → Service Account)

const PROJECT  = import.meta.env.VITE_VERTEX_PROJECT_ID
const LOCATION = import.meta.env.VITE_VERTEX_LOCATION
const TOKEN    = import.meta.env.VITE_VERTEX_ACCESS_TOKEN

export function imageToBase64(imageSource) {
  if (imageSource instanceof HTMLVideoElement) {
    const canvas = document.createElement('canvas')
    canvas.width = 224
    canvas.height = 224
    canvas.getContext('2d').drawImage(imageSource, 0, 0, 224, 224)
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1]
  }
  if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
    return imageSource.split(',')[1]
  }
  return imageSource
}

export async function vertexPredict(endpointId, imageBase64) {
  if (!PROJECT || !LOCATION || !TOKEN) return null
  try {
    const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/endpoints/${endpointId}:predict`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instances: [{ content: imageBase64 }] }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function vertexStage1(imageBase64, endpointId) {
  const raw = await vertexPredict(endpointId, imageBase64)
  if (!raw) return null
  try {
    const pred = raw.predictions[0]
    const names = pred.displayNames
    const confidences = pred.confidences
    const topIdx = confidences.indexOf(Math.max(...confidences))
    const materialType = names[topIdx]
    const confidence = +confidences[topIdx].toFixed(2)
    const sizeKg = +(0.1 + Math.random() * 1.9).toFixed(2)
    return { pass: true, materialType, confidence, sizeKg }
  } catch {
    return null
  }
}

export async function vertexStage2(imageBase64, endpointId) {
  const raw = await vertexPredict(endpointId, imageBase64)
  if (!raw) return null
  try {
    const pred = raw.predictions[0]
    const names = pred.displayNames
    const confidences = pred.confidences
    const topIdx = confidences.indexOf(Math.max(...confidences))
    const topClass = names[topIdx]
    const topConf = confidences[topIdx]

    let cleanlinessScore, grade, failReasons
    if (topClass === 'clean' && topConf > 0.8) {
      cleanlinessScore = 85 + Math.floor(Math.random() * 11)
      grade = 'A'
      failReasons = []
    } else if (topClass === 'clean' && topConf >= 0.6) {
      cleanlinessScore = 65
      grade = 'B'
      failReasons = []
    } else {
      cleanlinessScore = 35
      grade = 'C'
      failReasons = ['Item may be contaminated']
    }
    return { pass: cleanlinessScore >= 30, cleanlinessScore, grade, failReasons }
  } catch {
    return null
  }
}
