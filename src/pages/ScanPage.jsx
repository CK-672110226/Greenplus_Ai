import { useRef, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { WASTE_ITEMS, pricePerKg, localName } from '../data/wasteItems'
import { addToBasket, setLastScan } from '../store/wasteSlice'
import { useSelector } from 'react-redux'

const MATERIALS = Object.keys(WASTE_ITEMS)

function mockInfer() {
  const isTroll = Math.random() < 0.08
  if (isTroll) return { troll: true }

  const materialType = MATERIALS[Math.floor(Math.random() * MATERIALS.length)]
  const score = 20 + Math.floor(Math.random() * 81)
  const grade = score >= 80 ? 'A' : score >= 50 ? 'B' : 'C'
  const weight = +(0.1 + Math.random() * 1.9).toFixed(2)
  const confidence = +(0.55 + Math.random() * 0.45).toFixed(2)

  return { materialType, score, grade, weight, confidence, troll: false }
}

function ScoreBar({ score }) {
  const color = score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--orange)' : '#E53E3E'
  return (
    <div className="w-full flex flex-col gap-1">
      <div className="w-full h-2 bg-[var(--paper)] border-[1.5px] border-[var(--ink)]">
        <div
          style={{ width: `${score}%`, background: color, height: '100%', transition: 'width 0.4s ease' }}
        />
      </div>
      <div className="flex justify-between">
        <span className="font-data text-[10px] text-[var(--ink-3)]">0</span>
        <span className="font-data text-[11px] text-[var(--ink-2)]">{score}/100</span>
        <span className="font-data text-[10px] text-[var(--ink-3)]">100</span>
      </div>
    </div>
  )
}

export function ScanPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [phase, setPhase]   = useState('idle')
  const [result, setResult] = useState(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setPhase('idle')
    } catch {
      setPhase('error')
    }
  }, [])

  async function handleScan() {
    setPhase('analyzing')
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))
    const infer = mockInfer()
    if (infer.troll) {
      setPhase('troll')
      return
    }
    setResult(infer)
    dispatch(setLastScan(infer))
    setPhase('result')
  }

  function handleAdd() {
    if (!result) return
    const id = `${result.materialType}_${Date.now()}`
    dispatch(addToBasket({
      id,
      materialType: result.materialType,
      grade: result.grade,
      weight: result.weight,
      pricePerKg: pricePerKg(result.materialType, result.grade),
    }))
    toast.success(`${localName(result.materialType, language)} added to basket`)
    handleReset()
  }

  function handleReset() {
    setPhase('idle')
    setResult(null)
  }

  const hasCamera = phase !== 'error'

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.scan}</h1>

      <Card className="w-full max-w-sm flex flex-col gap-4">
        {/* Camera viewport */}
        <div className="relative w-full aspect-video bg-[var(--ink)] overflow-hidden border-[1.5px] border-[var(--ink)]">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Corner guide brackets */}
          {(phase === 'idle' || phase === 'analyzing') && (
            <>
              <span className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[var(--green)]" />
              <span className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[var(--green)]" />
              <span className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[var(--green)]" />
              <span className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[var(--green)]" />
            </>
          )}

          {/* Analyzing overlay */}
          {phase === 'analyzing' && (
            <div className="absolute inset-0 bg-[#062040cc] flex items-center justify-center">
              <span className="font-data text-[13px] text-[var(--green)] uppercase tracking-widest">{t.analyzing}</span>
            </div>
          )}

          {/* No camera placeholder */}
          {!streamRef.current && phase !== 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--paper-2)]">
              <span className="font-data text-[11px] text-[var(--ink-4)] uppercase tracking-widest">{t.scanTap}</span>
            </div>
          )}
        </div>

        {/* Troll overlay */}
        {phase === 'troll' && (
          <div className="w-full flex flex-col items-center gap-3 py-4 bg-[var(--orange)] border-[1.5px] border-[var(--ink)] px-4">
            <span className="font-data text-[12px] text-[var(--ink)] uppercase tracking-widest">{t.antiTroll}</span>
            <p className="font-body text-[14px] text-[var(--ink)] m-0 text-center">{t.rejectedHint}</p>
            <Button variant="secondary" onClick={handleReset}>{t.scanAgain}</Button>
          </div>
        )}

        {/* Error overlay */}
        {phase === 'error' && (
          <div className="w-full flex flex-col items-center gap-3 py-4 border-[1.5px] border-[var(--orange)] px-4">
            <p className="font-body text-[14px] text-[var(--orange)] m-0 text-center">{t.cameraError}</p>
          </div>
        )}

        {/* Result card */}
        {phase === 'result' && result && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <GradeTag grade={result.grade} />
              <span className="font-body text-[17px] text-[var(--ink)] font-semibold">
                {localName(result.materialType, language)}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.scoreLabel}</span>
              <ScoreBar score={result.score} />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">{t.estWeight}</span>
              <span className="font-data text-[13px] text-[var(--ink)]">{result.weight} kg</span>

              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">฿/kg</span>
              <span className="font-data text-[13px] text-[var(--ink)]">
                ฿{pricePerKg(result.materialType, result.grade).toFixed(2)}
              </span>

              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Total</span>
              <span className="font-data text-[14px] text-[var(--green)] font-bold">
                ฿{(pricePerKg(result.materialType, result.grade) * result.weight).toFixed(2)}
              </span>

              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">{t.confidence}</span>
              <span className="font-data text-[13px] text-[var(--ink)]">{(result.confidence * 100).toFixed(0)}%</span>
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="primary" onClick={handleAdd} fullWidth>{t.addToBasket}</Button>
              <Button variant="secondary" onClick={handleReset}>{t.scanAgain}</Button>
            </div>
          </div>
        )}

        {/* Action buttons for idle/analyzing state */}
        {(phase === 'idle' || phase === 'analyzing') && (
          <div className="flex flex-col gap-2">
            {!streamRef.current && hasCamera && (
              <Button variant="secondary" fullWidth onClick={startCamera}>Start Camera</Button>
            )}
            {streamRef.current && (
              <Button
                variant="primary"
                fullWidth
                onClick={handleScan}
                disabled={phase === 'analyzing'}
              >
                {phase === 'analyzing' ? t.analyzing : t.scanBtn}
              </Button>
            )}
          </div>
        )}
      </Card>
    </main>
  )
}
