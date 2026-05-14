import { useRef, useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { pricePerKg, localName } from '../data/wasteItems'
import { getRulesFor, SEVERITY_COLOR } from '../data/wasteRules'
import { addToBasket, setLastScan } from '../store/wasteSlice'
import { twoStageInfer } from '../services/twoStageAI'
import { useScanInsert } from '../hooks/useScanInsert'

function ScoreBar({ score }) {
  const color = score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--orange)' : '#E53E3E'
  return (
    <div className="w-full flex flex-col gap-1">
      <div className="w-full h-2 bg-[var(--paper)] border-[1.5px] border-[var(--ink)]">
        <div style={{ width: `${score}%`, background: color, height: '100%', transition: 'width 0.4s ease' }} />
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
  const aiConfig = useSelector(s => s.aiConfig)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileRef  = useRef(null)

  // Start as 'starting' so the effect never needs to call setPhase synchronously
  const [phase, setPhase]         = useState('starting')   // starting | idle | analyzing | result | troll | lowConfidence | error
  const [result, setResult]       = useState(null)
  const [uploadSrc, setUploadSrc] = useState(null)         // object URL for preview
  const [inputMode, setInputMode] = useState('camera')     // 'camera' | 'upload'
  const [dirtyAlert, setDirtyAlert] = useState(false)
  const insertScan = useScanInsert()

  // Swipe logic
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)
  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isRightSwipe) handleSwipeRight()
    if (isLeftSwipe) handleSwipeLeft()
  }

  function handleSwipeRight() {
    if (result?.factorScores?.cleanliness < 5) {
      setDirtyAlert(true)
    } else {
      handleAdd()
    }
  }

  function handleSwipeLeft() {
    toast('Discarded item')
    handleReset()
  }

  function handleConfirmClean() {
    setDirtyAlert(false)
    handleAdd()
  }

  function handleRejectClean() {
    setDirtyAlert(false)
    toast.error(language === 'th' ? 'กรุณาทำความสะอาดก่อนนำมาขาย' : 'Please wash it before selling')
    handleReset()
  }

  // startCamera only calls setState after await (async), never synchronously
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setInputMode('camera')
      setPhase('idle')
    } catch {
      setPhase('error')
    }
  }, [])

  // Auto-start camera on mount; stop stream on unmount.
  // setState inside startCamera only fires after await, never synchronously.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { startCamera(); return () => { streamRef.current?.getTracks().forEach(t => t.stop()) } }, [startCamera])

  async function runInference(source) {
    setPhase('analyzing')
    try {
      const infer = await twoStageInfer(source, {
        confidenceThreshold: aiConfig.confidenceThreshold,
        onnxStage1Url:       aiConfig.onnxStage1Url || null,
        onnxStage2Url:       aiConfig.onnxStage2Url || null,
      })
      if (infer.troll)         { setPhase('troll');         return }
      if (infer.lowConfidence) { setPhase('lowConfidence'); return }
      setResult(infer)
      dispatch(setLastScan(infer))
      setPhase('result')
    } catch {
      toast.error('Inference failed — try again')
      setPhase('idle')
    }
  }

  async function handleScan() {
    if (videoRef.current) await runInference(videoRef.current)
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset file input so same file can be selected again
    e.target.value = ''

    // Stop camera
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null

    const url = URL.createObjectURL(file)
    setUploadSrc(url)
    setInputMode('upload')

    const img = new window.Image()
    img.onload = () => runInference(img)
    img.onerror = () => { toast.error('Could not load image'); setPhase('idle') }
    img.src = url
  }

  function handleAdd() {
    if (!result) return
    const id = `${result.materialType}_${Date.now()}`
    dispatch(addToBasket({
      id,
      materialType: result.materialType,
      grade:        result.grade,
      weight:       result.weight,
      pricePerKg:   pricePerKg(result.materialType, result.grade),
    }))
    insertScan(result)
    toast.success(`${localName(result.materialType, language)} added to basket`)
    handleReset()
  }

  function handleReset() {
    if (uploadSrc) URL.revokeObjectURL(uploadSrc)
    setUploadSrc(null)
    setResult(null)
    setDirtyAlert(false)
    setPhase('starting')   // ok here — this is an event handler, not an effect
    startCamera()
  }

  const isMockMode = !aiConfig.onnxStage1Url

  return (
    <main className="flex flex-col items-center px-4 py-6 gap-5">
      <div className="w-full max-w-4xl flex items-center justify-between">
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.scan}</h1>
        <span className={`font-data text-[9px] uppercase tracking-widest px-2 py-0.5 border-[1.5px] ${isMockMode ? 'border-[var(--ink-4)] text-[var(--ink-4)]' : 'border-[var(--green)] text-[var(--green)]'}`}>
          {isMockMode ? 'Demo' : 'ONNX'}
        </span>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="w-full flex flex-col gap-4 relative overflow-hidden h-fit">
        {/* Viewport */}
        <div className={`relative w-full aspect-video bg-[var(--ink)] overflow-hidden border-[1.5px] border-[var(--ink)] transition-all ${phase === 'result' ? 'h-32 opacity-50' : ''}`}>
          {inputMode === 'camera'
            ? <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            : uploadSrc && <img src={uploadSrc} alt="scan" className="w-full h-full object-contain bg-[var(--paper-2)]" />
          }

          {/* Corner brackets for camera mode */}
          {inputMode === 'camera' && (phase === 'idle' || phase === 'analyzing') && (
            <>
              <span className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[var(--green)]" />
              <span className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[var(--green)]" />
              <span className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[var(--green)]" />
              <span className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[var(--green)]" />
            </>
          )}

          {/* Starting / no stream placeholder */}
          {phase === 'starting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--paper-2)]">
              <span className="font-data text-[11px] text-[var(--ink-4)] uppercase tracking-widest">{t.startingCamera ?? 'Starting camera…'}</span>
            </div>
          )}

          {/* Analyzing overlay */}
          {phase === 'analyzing' && (
            <div className="absolute inset-0 bg-[#062040cc] flex flex-col items-center justify-center gap-2">
              <span className="font-data text-[13px] text-[var(--green)] uppercase tracking-widest">{t.analyzing}</span>
              {isMockMode && (
                <span className="font-data text-[9px] text-[var(--green-soft)] uppercase tracking-widest opacity-70">demo mode</span>
              )}
            </div>
          )}
        </div>

        {/* Troll detection */}
        {phase === 'troll' && (
          <div className="flex flex-col items-center gap-3 py-4 px-4 bg-[var(--orange)] border-[1.5px] border-[var(--ink)]">
            <span className="font-data text-[12px] text-[var(--ink)] uppercase tracking-widest">{t.antiTroll}</span>
            <p className="font-body text-[14px] text-[var(--ink)] m-0 text-center">{t.rejectedHint}</p>
            <Button variant="secondary" onClick={handleReset}>{t.scanAgain}</Button>
          </div>
        )}
        {/* Low confidence — different from troll: not rejected, just unclear */}
        {phase === 'lowConfidence' && (
          <div className="flex flex-col items-center gap-3 py-4 px-4 border-[1.5px] border-[var(--ink-3)]">
            <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.lowConfidenceTitle ?? 'Low confidence'}</span>
            <p className="font-body text-[14px] text-[var(--ink-3)] m-0 text-center">{t.lowConfidenceHint ?? "AI couldn't identify the item clearly. Try better lighting or a clearer angle."}</p>
            <Button variant="secondary" onClick={handleReset}>{t.scanAgain}</Button>
          </div>
        )}

        {/* Camera error */}
        {phase === 'error' && (
          <div className="flex flex-col items-center gap-3 py-4 px-4 border-[1.5px] border-[var(--orange)]">
            <p className="font-body text-[14px] text-[var(--orange)] m-0 text-center">{t.cameraError}</p>
            <Button variant="secondary" fullWidth onClick={() => fileRef.current?.click()}>
              {t.uploadInstead ?? 'Upload image instead'}
            </Button>
          </div>
        )}

        {/* Idle / scanning controls */}
        {(phase === 'idle' || phase === 'analyzing') && (
          <div className="flex flex-col gap-2">
            {inputMode === 'camera' && streamRef.current && (
              <Button
                variant="primary"
                fullWidth
                onClick={handleScan}
                disabled={phase === 'analyzing'}
              >
                {phase === 'analyzing' ? t.analyzing : t.scanBtn}
              </Button>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="font-data text-[11px] uppercase tracking-widest text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer py-1 self-center transition-colors"
            >
              {t.uploadImage ?? 'Upload image'}
            </button>
          </div>
        )}
      </Card>

      {/* RIGHT COLUMN (DESKTOP) / BOTTOM SHEET (MOBILE) */}
      <div className="w-full h-full flex flex-col gap-4">
        {/* Result Bottom Sheet */}
        {phase === 'result' && result && !dirtyAlert && (
          <Card className="flex flex-col gap-3 pt-2 pb-1 animate-in slide-in-from-bottom-4 md:slide-in-from-right-4 h-fit">
            <div 
              className="md:hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEndEvent}
            >
              <div className="w-12 h-1 bg-[var(--ink-4)] mx-auto rounded-full mb-1" />
              <p className="text-center font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest mt-0 mb-2">
                {language === 'th' ? '▽ ปัดหน้าจอเพื่อเลือก' : '▽ Swipe to decide'}
              </p>
            </div>
            
            <div className="hidden md:block">
              <p className="text-center font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest mt-0 mb-2">
                Scan Results
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GradeTag grade={result.grade} />
                <span className="font-body text-[17px] text-[var(--ink)] font-semibold">
                  {localName(result.materialType, language)}
                </span>
              </div>
              {(result.source === 'mock' || result.source === 'mock-fallback') && (
                <span className="font-data text-[9px] text-[var(--ink-4)] border border-[var(--ink-4)] px-1.5 py-0.5 uppercase">demo</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.scoreLabel}</span>
              <ScoreBar score={result.score} />
            </div>

            {/* Factor breakdown */}
            {result.factorScores && (
              <div className="flex flex-col gap-1 mt-2 mb-2 p-2 bg-[var(--paper-2)] border-[1px] border-[var(--ink-4)]">
                <span className="font-data text-[10px] text-[var(--ink-3)] uppercase mb-1">Factor Breakdown</span>
                {Object.entries(result.factorScores).map(([factor, fscore]) => (
                  <div key={factor} className="flex items-center justify-between">
                    <span className="font-data text-[10px] text-[var(--ink-2)] capitalize">{factor}</span>
                    <div className="flex items-center gap-2 w-1/2">
                      <div className="w-full h-1.5 bg-[var(--paper)] border-[1px] border-[var(--ink)]">
                        <div style={{ width: `${fscore * 10}%`, background: fscore >= 5 ? 'var(--green)' : 'var(--orange)', height: '100%' }} />
                      </div>
                      <span className="font-data text-[9px] w-6 text-right">{(fscore).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-[1px] border-[var(--ink-4)] p-3">
              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">{t.estWeight}</span>
              <span className="font-data text-[13px] text-[var(--ink)] text-right">{result.weight} kg</span>

              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">฿/kg</span>
              <span className="font-data text-[13px] text-[var(--ink)] text-right">
                ฿{pricePerKg(result.materialType, result.grade).toFixed(2)}
              </span>

              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Total</span>
              <span className="font-data text-[14px] text-[var(--green)] font-bold text-right">
                ฿{(pricePerKg(result.materialType, result.grade) * result.weight).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 pb-2 px-2 border-t-[1.5px] border-[var(--ink-4)] mt-2">
              <div className="flex flex-col items-center flex-1 cursor-pointer hover:bg-[var(--paper-2)] py-2 transition-colors" onClick={handleSwipeLeft}>
                <span className="font-brand text-[20px] text-[#E53E3E]">⟵</span>
                <span className="font-data text-[10px] text-[var(--ink-2)] uppercase">{language === 'th' ? 'ทิ้ง (Discard)' : 'Discard'}</span>
              </div>
              <div className="w-px h-8 bg-[var(--ink-4)]" />
              <div className="flex flex-col items-center flex-1 cursor-pointer hover:bg-[var(--paper-2)] py-2 transition-colors" onClick={handleSwipeRight}>
                <span className="font-brand text-[20px] text-[var(--green-ink)]">⟶</span>
                <span className="font-data text-[10px] text-[var(--ink-2)] uppercase">{language === 'th' ? 'ขาย (Sell)' : 'Sell'}</span>
              </div>
            </div>
            
            <Button variant="ghost" className="mt-2 text-[10px]" onClick={handleReset}>{t.scanAgain}</Button>
          </Card>
        )}

        {/* Dirty Alert Popup */}
        {dirtyAlert && (
          <div className="md:relative absolute inset-0 bg-[#1A1A1Ae6] flex flex-col justify-center px-4 z-10 animate-in fade-in">
            <Card className="bg-[var(--paper)] flex flex-col gap-4 border-[2px] border-[var(--orange)] shadow-[4px_4px_0_var(--orange)]">
              <h2 className="font-brand text-[20px] text-[var(--orange)] m-0">
                {language === 'th' ? 'พบความสกปรก!' : 'Contamination Detected!'}
              </h2>
              <p className="font-body text-[14px] text-[var(--ink)] m-0 leading-relaxed">
                {language === 'th' 
                  ? 'สิ่งนี้มีคราบสกปรก คุณได้ทำความสะอาดแล้วใช่ไหม?' 
                  : 'This item is dirty. Have you washed it?'}
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <Button variant="primary" onClick={handleConfirmClean}>
                  {language === 'th' ? 'ใช่ (ทำความสะอาดแล้ว)' : 'Yes, I washed it'}
                </Button>
                <Button variant="secondary" onClick={handleRejectClean}>
                  {language === 'th' ? 'ไม่ (ยังไม่ได้ทำ)' : 'No, not yet'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </main>
  )
}
