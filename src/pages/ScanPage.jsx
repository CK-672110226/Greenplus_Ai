import { useRef, useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToBasket, setLastScan } from '../store/wasteSlice'
import { GradeTag } from '../components/GradeTag'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { useT } from '../hooks/useT'
import { pricePerKg, localName, WASTE_ITEMS } from '../data/wasteItems'

// ── Mock inference (replaced by ONNX model in M8) ────────────────
const MATERIAL_KEYS = Object.keys(WASTE_ITEMS)

// Typical unit weights (kg) per material for the weight estimate
const UNIT_WEIGHT = {
  pet_bottle_clear: 0.03,
  aluminum_can:     0.015,
  cardboard:        0.35,
  newspaper:        0.20,
  mixed_plastic:    0.08,
  copper:           0.15,
  glass:            0.30,
  cooking_oil:      0.50,
}

// 8% chance of troll detection to test anti-troll UI
const TROLL_PROBABILITY = 0.08

function mockInfer() {
  if (Math.random() < TROLL_PROBABILITY) {
    return { isTroll: true }
  }
  const materialType = MATERIAL_KEYS[Math.floor(Math.random() * MATERIAL_KEYS.length)]
  const score        = 20 + Math.floor(Math.random() * 81) // 20 – 100
  const grade        = score >= 80 ? 'A' : score >= 50 ? 'B' : 'C'
  const weight       = +(UNIT_WEIGHT[materialType] * (0.8 + Math.random() * 0.4)).toFixed(3)
  const confidence   = +(0.60 + Math.random() * 0.40).toFixed(2)
  return { isTroll: false, materialType, score, grade, weight, confidence }
}

// ── Score bar ─────────────────────────────────────────────────────
function ScoreBar({ score }) {
  const pct = Math.min(100, Math.max(0, score))
  const color = score >= 80 ? 'var(--green)' : score >= 50 ? '#EAB308' : 'var(--orange)'
  return (
    <div className="w-full h-2 bg-[var(--ink-4)] rounded-none overflow-hidden">
      <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export function ScanPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)

  const videoRef  = useRef(null)
  const streamRef = useRef(null)

  const [phase, setPhase]   = useState('idle')   // idle | analyzing | result | troll | error
  const [result, setResult] = useState(null)
  const [added, setAdded]   = useState(false)

  // Start camera on mount
  useEffect(() => {
    let cancelled = false
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch {
        if (!cancelled) setPhase('error')
      }
    }
    startCamera()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const handleScan = useCallback(async () => {
    if (phase !== 'idle') return
    setPhase('analyzing')
    // Simulated inference latency (~1.5 s)
    await new Promise(r => setTimeout(r, 1500))
    const inference = mockInfer()
    if (inference.isTroll) {
      setPhase('troll')
    } else {
      setResult(inference)
      dispatch(setLastScan(inference))
      setAdded(false)
      setPhase('result')
    }
  }, [phase, dispatch])

  const handleAddToBasket = useCallback(() => {
    if (!result) return
    dispatch(addToBasket({
      id:           crypto.randomUUID(),
      materialType: result.materialType,
      grade:        result.grade,
      weight:       result.weight,
      pricePerKg:   pricePerKg(result.materialType, result.grade),
    }))
    setAdded(true)
  }, [result, dispatch])

  const handleReset = useCallback(() => {
    setPhase('idle')
    setResult(null)
    setAdded(false)
  }, [])

  return (
    <main className="flex flex-col items-center px-4 py-6 gap-5 max-w-lg mx-auto">

      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0 self-start">{t.scan}</h1>

      {/* Viewfinder */}
      <div className="relative w-full aspect-[4/3] bg-black overflow-hidden border-[1.5px] border-[var(--ink)]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Corner guides */}
        {(phase === 'idle' || phase === 'analyzing') && (
          <>
            <span className="absolute top-3 left-3  w-6 h-6 border-t-2 border-l-2 border-[var(--green)]" />
            <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[var(--green)]" />
            <span className="absolute bottom-3 left-3  w-6 h-6 border-b-2 border-l-2 border-[var(--green)]" />
            <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[var(--green)]" />
          </>
        )}

        {/* Analyzing overlay */}
        {phase === 'analyzing' && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--green)] border-t-transparent rounded-full animate-spin" />
            <p className="font-data text-[13px] text-white uppercase tracking-widest">{t.analyzing}</p>
          </div>
        )}

        {/* Troll overlay */}
        {phase === 'troll' && (
          <div className="absolute inset-0 bg-[var(--orange)]/90 flex flex-col items-center justify-center gap-4 px-6">
            <p className="font-brand text-[22px] text-white text-center leading-tight">{t.antiTroll}</p>
            <button
              type="button"
              onClick={handleReset}
              className="font-data text-[12px] uppercase tracking-wider text-white border-2 border-white px-4 py-2 bg-transparent cursor-pointer"
            >
              {t.scanAgain}
            </button>
          </div>
        )}

        {/* Error overlay */}
        {phase === 'error' && (
          <div className="absolute inset-0 bg-[var(--paper)] flex items-center justify-center px-6">
            <p className="font-body text-[14px] text-[var(--ink-2)] text-center">{t.cameraError}</p>
          </div>
        )}
      </div>

      {/* Scan button — shown in idle mode */}
      {phase === 'idle' && (
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="font-body text-[13px] text-[var(--ink-3)] text-center m-0">{t.scanTap}</p>
          <Button variant="primary" onClick={handleScan} fullWidth>
            {t.scanBtn}
          </Button>
        </div>
      )}

      {/* Result card */}
      {phase === 'result' && result && (
        <Card className="w-full flex flex-col gap-4">
          <p className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest m-0">{t.scanResult}</p>

          {/* Grade + name + price */}
          <div className="flex items-center gap-3">
            <GradeTag grade={result.grade} />
            <div className="flex-1 min-w-0">
              <p className="font-body text-[16px] text-[var(--ink)] m-0 font-semibold">
                {localName(result.materialType, language)}
              </p>
              <p className="font-data text-[12px] text-[var(--ink-3)] m-0">
                ฿{pricePerKg(result.materialType, result.grade)}/kg
              </p>
            </div>
            <div className="text-right">
              <p className="font-data text-[20px] text-[var(--green)] font-bold m-0">
                ฿{(result.weight * pricePerKg(result.materialType, result.grade)).toFixed(2)}
              </p>
              <p className="font-data text-[11px] text-[var(--ink-3)] m-0">
                {t.estWeight} {result.weight} kg
              </p>
            </div>
          </div>

          {/* Score bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-wider">{t.scoreLabel}</span>
              <span className="font-data text-[13px] text-[var(--ink)] font-bold">{result.score} / 100</span>
            </div>
            <ScoreBar score={result.score} />
          </div>

          {/* Confidence */}
          <p className="font-data text-[11px] text-[var(--ink-3)] m-0">
            {t.confidence}: {Math.round(result.confidence * 100)}%
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="primary"
              onClick={handleAddToBasket}
              fullWidth
              disabled={added}
            >
              {added ? '✓' : t.addToBasket}
            </Button>
            <Button variant="secondary" onClick={handleReset} fullWidth>
              {t.scanAgain}
            </Button>
          </div>
        </Card>
      )}
    </main>
  )
}
