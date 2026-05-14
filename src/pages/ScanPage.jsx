import { useRef, useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { pricePerKg, localName, WASTE_ITEMS } from '../data/wasteItems'
import { getRulesFor, SEVERITY_COLOR } from '../data/wasteRules'
import { addToBasket, setLastScan } from '../store/wasteSlice'
import { twoStageInfer } from '../services/twoStageAI'
import { useScanInsert } from '../hooks/useScanInsert'
import { supabase } from '../lib/supabase'

/* ── Contamination meter ─────────────────────────────────────── */
function ContaminationMeter({ score }) {
  const level = score >= 70 ? 0 : score >= 40 ? 1 : 2
  const segments = [
    { label: 'clean',  color: 'var(--green)',  bg: 'var(--green-soft)' },
    { label: 'mixed',  color: 'var(--orange)', bg: 'rgba(245,158,11,.15)' },
    { label: 'contam.',color: '#E53E3E',        bg: 'rgba(229,62,62,.12)' },
  ]
  return (
    <div className="flex flex-col gap-2">
      <span className="font-data text-[9px] uppercase tracking-[0.15em] text-[var(--ink-4)]">Contamination</span>
      <div className="flex gap-1">
        {segments.map((seg, i) => (
          <div key={seg.label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full h-2 border-[1.5px]"
              style={{
                borderColor: i === level ? seg.color : 'var(--ink-4)',
                background:  i === level ? seg.bg : 'transparent',
              }}
            />
            <span className="font-data text-[9px] uppercase tracking-wide" style={{ color: i === level ? seg.color : 'var(--ink-4)' }}>
              {seg.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Batch queue item row ────────────────────────────────────── */
function QueueRow({ item, language, onRemove }) {
  const value = pricePerKg(item.materialType, item.grade) * (item.weight ?? 0)
  return (
    <div className="flex items-center justify-between py-2.5 border-b-[1px] border-[var(--ink-4)] last:border-b-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-body text-[14px] text-[var(--ink)] truncate">
          {localName(item.materialType, language)}
        </span>
        <span className="font-data text-[10px] text-[var(--ink-3)]">
          {(item.weight ?? 0).toFixed(2)} kg
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <GradeTag grade={item.grade} />
        <span className="font-data text-[13px] text-[var(--ink)]">฿{value.toFixed(0)}</span>
        <button
          onClick={() => onRemove(item.id)}
          className="font-data text-[11px] text-[var(--ink-4)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer p-0 leading-none"
          aria-label="remove"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

/* ── ScanPage ────────────────────────────────────────────────── */
export function ScanPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)
  const aiConfig = useSelector(s => s.aiConfig)
  const basket   = useSelector(s => s.waste?.basket ?? [])
  const videoRef  = useRef(null)
  const streamRef = useRef(null)
  const fileRef   = useRef(null)
  const insertScan = useScanInsert()

  const [phase, setPhase]                   = useState('starting')
  const [result, setResult]                 = useState(null)
  const [uploadSrc, setUploadSrc]           = useState(null)
  const [inputMode, setInputMode]           = useState('camera')
  const [, setHasStream]                    = useState(false)
  const [dirtyAlert, setDirtyAlert]         = useState(false)
  const [batchMode, setBatchMode]           = useState(false)
  const [batchQueue, setBatchQueue]         = useState([])
  const [showReport, setShowReport]         = useState(false)
  const [reportMaterial, setReportMaterial] = useState(Object.keys(WASTE_ITEMS)[0])

  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd]     = useState(null)
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)
  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe  = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isRightSwipe) handleSwipeRight()
    if (isLeftSwipe)  handleSwipeLeft()
  }

  function handleSwipeRight() {
    if (result?.factorScores?.cleanliness < 5) {
      setDirtyAlert(true)
    } else {
      handleAddSingle()
    }
  }

  function handleSwipeLeft() {
    toast('Discarded item')
    handleReset()
  }

  const isMockMode   = !aiConfig.onnxStage1Url
  const activeBasket = basket.filter(i => !i.skipped)
  const basketTotal  = activeBasket.reduce((s, i) => s + pricePerKg(i.materialType, i.grade) * (i.weight ?? 0), 0)
  const queueTotal   = batchQueue.reduce((s, i) => s + pricePerKg(i.materialType, i.grade) * (i.weight ?? 0), 0)
  const queueKg      = batchQueue.reduce((s, i) => s + (i.weight ?? 0), 0)

  /* ── Camera lifecycle ─────────────────────────────────────── */
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      setHasStream(true)
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { startCamera(); return () => { streamRef.current?.getTracks().forEach(t => t.stop()) } }, [startCamera])

  /* ── Inference ────────────────────────────────────────────── */
  async function runInference(source) {
    setPhase('analyzing')
    try {
      const infer = await twoStageInfer(source, {
        confidenceThreshold: aiConfig.confidenceThreshold,
        onnxStage1Url:       aiConfig.onnxStage1Url || null,
        onnxStage2Url:       aiConfig.onnxStage2Url || null,
      })
      if (infer.troll || infer.lowConfidence) { setPhase('troll'); return }

      setResult(infer)
      dispatch(setLastScan(infer))

      if (batchMode) {
        setBatchQueue(q => [...q, { ...infer, id: `${infer.materialType}_${Date.now()}` }])
        setPhase('idle')
      } else {
        setPhase('result')
      }
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
    e.target.value = ''
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setHasStream(false)
    const url = URL.createObjectURL(file)
    setUploadSrc(url)
    setInputMode('upload')
    const img = new window.Image()
    img.onload  = () => runInference(img)
    img.onerror = () => { toast.error('Could not load image'); setPhase('idle') }
    img.src = url
  }

  /* ── Report misidentification ─────────────────────────────── */
  async function handleSubmitReport() {
    try {
      await supabase.from('user_reports').insert({
        reporter_id:      null,
        claimed_material: reportMaterial,
        ai_material:      result?.materialType ?? null,
        ai_grade:         result?.grade ?? null,
      })
    } catch { /* silent */ }
    toast.success(t.reportSuccess ?? 'Report submitted. Thank you!')
    setShowReport(false)
  }

  /* ── Add to basket ────────────────────────────────────────── */
  function handleAddSingle() {
    if (!result) return
    if (result?.factorScores?.cleanliness != null && result.factorScores.cleanliness < 5) {
      setDirtyAlert(true)
      return
    }
    // eslint-disable-next-line react-hooks/purity
    const id = `${result.materialType}_${Date.now()}`
    dispatch(addToBasket({ id, materialType: result.materialType, grade: result.grade, weight: result.weight, pricePerKg: pricePerKg(result.materialType, result.grade) }))
    insertScan(result)
    toast.success(`${localName(result.materialType, language)} added`)
    handleReset()
  }

  function handleConfirmClean() {
    setDirtyAlert(false)
    // eslint-disable-next-line react-hooks/purity
    const id = `${result.materialType}_${Date.now()}`
    dispatch(addToBasket({ id, materialType: result.materialType, grade: result.grade, weight: result.weight, pricePerKg: pricePerKg(result.materialType, result.grade) }))
    insertScan(result)
    toast.success(`${localName(result.materialType, language)} added`)
    handleReset()
  }

  function handleRejectClean() {
    setDirtyAlert(false)
    toast.error(language === 'th' ? 'กรุณาทำความสะอาดก่อนนำมาขาย' : 'Please wash it before selling')
    handleReset()
  }

  function handleAddBatch() {
    if (batchQueue.length === 0) return
    batchQueue.forEach(item => {
      dispatch(addToBasket({ id: item.id, materialType: item.materialType, grade: item.grade, weight: item.weight, pricePerKg: pricePerKg(item.materialType, item.grade) }))
    })
    toast.success(`${batchQueue.length} items added to basket`)
    setBatchQueue([])
  }

  function handleRemoveFromQueue(id) {
    setBatchQueue(q => q.filter(i => i.id !== id))
  }

  function handleReset() {
    if (uploadSrc) URL.revokeObjectURL(uploadSrc)
    setUploadSrc(null)
    setResult(null)
    setDirtyAlert(false)
    setPhase('starting')
    startCamera()
  }

  /* ── Derived values for live analysis panel ─────────── */
  const liveResult = result
  const liveValue  = liveResult ? pricePerKg(liveResult.materialType, liveResult.grade) * liveResult.weight : 0
  const liveImpact = Math.round(liveValue * 1.8)
  const liveCO2    = liveResult ? (liveResult.weight * 0.38).toFixed(2) : '0.00'

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <div className="px-6 lg:px-8 pt-5 pb-3 border-b-[1.5px] border-[var(--ink)]">
        <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">
          Home / AI Scanner {batchMode ? '/ Batch' : ''}
        </span>
      </div>

      {/* ── 3-panel body ─────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* ══ PANEL 1: Camera ══════════════════════════════════ */}
        <div className="flex flex-col flex-1 min-w-0 lg:border-r-[1.5px] lg:border-[var(--ink)]">

          {/* Panel header */}
          <div className="px-6 lg:px-8 py-5 border-b-[1.5px] border-[var(--ink)]">
            <h1 className="font-brand text-[24px] lg:text-[28px] text-[var(--ink)] m-0 leading-tight">
              Point camera at the item
            </h1>
            <p className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest m-0 mt-1">
              {batchMode ? 'batch mode · scan many · review before submit' : 'single mode · scan one · add to basket'}
            </p>
          </div>

          {/* Camera controls */}
          <div className="flex items-center gap-3 px-6 lg:px-8 py-3 border-b-[1.5px] border-[var(--ink)] bg-[var(--paper-2)]">
            <button className="font-data text-[11px] text-[var(--ink-3)] border-[1.5px] border-[var(--ink-4)] px-2.5 py-1 bg-transparent cursor-not-allowed flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              flash ▾
            </button>
            <button className="font-data text-[11px] text-[var(--ink-3)] border-[1.5px] border-[var(--ink-4)] px-2.5 py-1 bg-transparent cursor-not-allowed">
              camera 1 ▾
            </button>

            <button
              onClick={() => { setBatchMode(b => !b); setBatchQueue([]); setResult(null) }}
              className={`flex items-center gap-2 px-3 py-1 border-[1.5px] font-data text-[11px] uppercase tracking-widest cursor-pointer transition-colors ${
                batchMode
                  ? 'bg-[var(--green)] border-[var(--ink)] text-[var(--paper)]'
                  : 'bg-transparent border-[var(--ink-4)] text-[var(--ink-3)] hover:border-[var(--ink)]'
              }`}
            >
              batch {batchMode ? 'ON' : 'OFF'}
            </button>

            <div className="ml-auto flex items-center gap-3">
              <span className={`flex items-center gap-1.5 font-data text-[10px] ${phase === 'idle' || phase === 'analyzing' ? 'text-[var(--green)]' : 'text-[var(--ink-4)]'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${phase === 'idle' || phase === 'analyzing' ? 'bg-[var(--green)]' : 'bg-[var(--ink-4)]'}`} />
                {phase === 'analyzing' ? 'analyzing' : phase === 'idle' ? 'live · ready' : phase}
              </span>
              <span className={`font-data text-[9px] border-[1.5px] px-1.5 py-0.5 uppercase ${isMockMode ? 'border-[var(--ink-4)] text-[var(--ink-4)]' : 'border-[var(--green)] text-[var(--green)]'}`}>
                {isMockMode ? 'demo' : 'onnx'}
              </span>
            </div>
          </div>

          {/* Viewfinder */}
          <div className="px-6 lg:px-8 py-5 flex flex-col gap-4 flex-1">
            <div className="relative w-full aspect-video bg-[var(--ink)] overflow-hidden border-[1.5px] border-[var(--ink)]">
              {inputMode === 'camera'
                ? <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                : uploadSrc && <img src={uploadSrc} alt="scan" className="w-full h-full object-contain bg-[var(--paper-2)]" />
              }

              {inputMode === 'camera' && (phase === 'idle' || phase === 'analyzing') && (
                <>
                  <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[var(--green)]" />
                  <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[var(--green)]" />
                  <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[var(--green)]" />
                  <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[var(--green)]" />
                </>
              )}

              {phase === 'starting' && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--paper-2)]">
                  <span className="font-data text-[11px] text-[var(--ink-4)] uppercase tracking-widest">Starting camera…</span>
                </div>
              )}

              {phase === 'analyzing' && (
                <div className="absolute inset-0 bg-[#062040cc] flex flex-col items-center justify-center gap-3">
                  <span className="font-data text-[13px] text-[var(--green)] uppercase tracking-widest animate-pulse">{t.analyzing}</span>
                  <span className="font-data text-[9px] text-[var(--green-soft)] uppercase tracking-widest opacity-60">gp-vision-2.1</span>
                </div>
              )}

              {batchMode && batchQueue.length > 0 && phase === 'idle' && (
                <div className="absolute bottom-0 left-0 right-0 bg-[#062040cc] px-4 py-2 flex items-center justify-between">
                  <span className="font-data text-[11px] text-[var(--paper)]">
                    detecting · {batchQueue.length} item{batchQueue.length !== 1 ? 's' : ''} in frame
                  </span>
                  <span className="font-data text-[11px] text-[var(--green)]">
                    {queueKg.toFixed(2)} kg · est. ฿{queueTotal.toFixed(0)}
                  </span>
                </div>
              )}

              {phase === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--paper-2)] p-4">
                  <p className="font-body text-[14px] text-[var(--orange)] m-0 text-center">{t.cameraError}</p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] px-4 py-2 bg-transparent cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
                  >
                    Upload image instead
                  </button>
                </div>
              )}
            </div>

            {phase === 'troll' && (
              <div className="flex flex-col items-center gap-3 py-4 px-4 bg-[var(--orange)] border-[1.5px] border-[var(--ink)]">
                <span className="font-data text-[12px] text-[var(--ink)] uppercase tracking-widest">{t.antiTroll}</span>
                <p className="font-body text-[14px] text-[var(--ink)] m-0 text-center">{t.rejectedHint}</p>
                <Button variant="secondary" onClick={handleReset}>{t.scanAgain}</Button>
              </div>
            )}

            {phase === 'lowConfidence' && (
              <div className="flex flex-col items-center gap-3 py-4 px-4 border-[1.5px] border-[var(--ink-3)]">
                <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.lowConfidenceTitle ?? 'Low confidence'}</span>
                <p className="font-body text-[14px] text-[var(--ink-3)] m-0 text-center">{t.lowConfidenceHint ?? "AI couldn't identify the item clearly. Try better lighting or a clearer angle."}</p>
                <Button variant="secondary" onClick={handleReset}>{t.scanAgain}</Button>
              </div>
            )}

            {/* Scan controls */}
            <div className="flex flex-col gap-2">
              {(phase === 'idle' || phase === 'analyzing') && (
                <Button variant="primary" fullWidth onClick={handleScan} disabled={phase === 'analyzing'}>
                  {phase === 'analyzing' ? t.analyzing : t.scanBtn}
                </Button>
              )}

              {!batchMode && phase === 'result' && liveResult && (
                <>
                  <div className="flex gap-3">
                    <Button variant="primary" fullWidth onClick={handleAddSingle}>{t.addToBasket}</Button>
                    <Button variant="secondary" onClick={handleReset}>{t.scanAgain}</Button>
                  </div>
                  {!showReport ? (
                    <button
                      type="button"
                      onClick={() => setShowReport(true)}
                      className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-4)] hover:text-[var(--orange)] bg-transparent border-none cursor-pointer py-1 self-start transition-colors"
                    >
                      {t.reportIssue ?? 'Report Issue'}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2 border-[1.5px] border-[var(--orange)] p-3">
                      <span className="font-data text-[11px] text-[var(--orange)] uppercase tracking-widest">{t.reportTitle ?? 'Report Misidentification'}</span>
                      <span className="font-body text-[13px] text-[var(--ink-3)]">{t.reportHint ?? 'What type of waste is this actually?'}</span>
                      <select
                        value={reportMaterial}
                        onChange={e => setReportMaterial(e.target.value)}
                        className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[14px] outline-none"
                      >
                        {Object.keys(WASTE_ITEMS).map(k => (
                          <option key={k} value={k}>{localName(k, language)}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleSubmitReport}>{t.reportSubmit ?? 'Submit Report'}</Button>
                        <button type="button" onClick={() => setShowReport(false)} className="font-data text-[11px] uppercase tracking-widest text-[var(--ink-3)] bg-transparent border-none cursor-pointer hover:text-[var(--ink)] transition-colors">
                          {t.reportCancel ?? 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-4)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer py-1 transition-colors"
                >
                  or upload image
                </button>
                {batchMode && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="ml-auto font-data text-[10px] uppercase tracking-widest text-[var(--ink-4)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer py-1 transition-colors"
                  >
                    ↺ retake
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══ PANEL 2: Batch Queue ══════════════════════════════ */}
        <div className="flex flex-col w-full lg:w-[260px] shrink-0 border-t-[1.5px] lg:border-t-0 lg:border-r-[1.5px] border-[var(--ink)]">
          <div className="px-5 py-4 border-b-[1.5px] border-[var(--ink)] bg-[var(--paper-2)]">
            <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">
              Batch queue · {batchQueue.length} item{batchQueue.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex flex-col flex-1 px-5 py-4 min-h-0 overflow-y-auto">
            {batchQueue.length > 0 ? (
              batchQueue.map(item => (
                <QueueRow key={item.id} item={item} language={language} onRemove={handleRemoveFromQueue} />
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 7 4 4 7 4"/><polyline points="17 4 20 4 20 7"/>
                  <polyline points="20 17 20 20 17 20"/><polyline points="7 20 4 20 4 17"/>
                  <rect x="8" y="8" width="8" height="8" rx="1"/>
                </svg>
                <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest leading-relaxed">
                  {batchMode ? 'scan items to fill queue' : 'enable batch to queue items'}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 px-5 py-4 border-t-[1.5px] border-[var(--ink)] bg-[var(--paper-2)]">
            <div className="flex items-center justify-between">
              <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">
                basket · {activeBasket.length} items
              </span>
              <span className="font-data text-[13px] text-[var(--ink)]">฿{basketTotal.toFixed(0)}</span>
            </div>

            {batchQueue.length > 0 && (
              <div className="flex items-center justify-between border-t-[1px] border-[var(--ink-4)] pt-2">
                <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">queue total</span>
                <span className="font-data text-[13px] text-[var(--green-ink)]">฿{queueTotal.toFixed(0)}</span>
              </div>
            )}

            <button
              onClick={handleAddBatch}
              disabled={batchQueue.length === 0}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--green)] border-[1.5px] border-[var(--ink)] shadow-[3px_3px_0_var(--ink)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all font-data text-[11px] uppercase tracking-widest text-[var(--paper)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ✓ Add to basket · keep scanning
            </button>
          </div>
        </div>

        {/* ══ PANEL 3: Live Analysis ════════════════════════════ */}
        <div className="flex flex-col w-full lg:w-[260px] shrink-0 border-t-[1.5px] lg:border-t-0 border-[var(--ink)]">
          <div className="px-5 py-4 border-b-[1.5px] border-[var(--ink)] bg-[var(--paper-2)] flex items-center justify-between">
            <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">Live analysis</span>
            {liveResult && (
              <span className="font-data text-[9px] border-[1.5px] border-[var(--green)] text-[var(--green)] px-1.5 py-0.5 uppercase tracking-widest">
                STAGE 2 / 2
              </span>
            )}
          </div>

          {liveResult ? (
            <div className="flex flex-col gap-5 px-5 py-5">
              <div className="flex flex-col gap-1">
                <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">Detected</span>
                <div className="flex items-center gap-2">
                  <GradeTag grade={liveResult.grade} />
                  <span className="font-brand text-[18px] text-[var(--ink)] leading-tight">
                    {localName(liveResult.materialType, language)}
                  </span>
                  {liveResult.source === 'mock' && (
                    <span className="font-data text-[9px] text-[var(--ink-4)] border border-[var(--ink-4)] px-1 py-0.5 uppercase">demo</span>
                  )}
                </div>
              </div>

              <ContaminationMeter score={liveResult.score} />

              <div className="flex flex-col gap-2">
                <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">Estimated value</span>
                <div className="border-[1.5px] border-[var(--ink)] p-3 flex flex-col gap-2 bg-[var(--paper-2)]">
                  <div className="font-data text-[11px] text-[var(--ink-3)]">
                    {liveResult.weight}kg
                    <span className="text-[var(--ink-4)] mx-1">×</span>
                    ฿{pricePerKg(liveResult.materialType, liveResult.grade).toFixed(0)}/kg
                  </div>
                  <div className="font-brand text-[28px] text-[var(--ink)] leading-none">
                    ฿ {liveValue.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-data text-[10px] text-[var(--green-ink)]">+{liveImpact} impact pts</span>
                  <span className="text-[var(--ink-4)] font-data text-[10px]">·</span>
                  <span className="font-data text-[10px] text-[var(--ink-3)]">CO₂ saved {liveCO2}kg</span>
                </div>
              </div>

              {getRulesFor(liveResult.materialType).length > 0 && (
                <div className="flex flex-col gap-1.5 border-t-[1px] border-[var(--ink-4)] pt-3">
                  {getRulesFor(liveResult.materialType).map((rule, i) => (
                    <p key={i} className="font-data text-[10px] m-0" style={{ color: SEVERITY_COLOR[rule.severity] }}>
                      {rule.severity === 'reject' ? '✕ ' : rule.severity === 'warning' ? '! ' : '· '}
                      {language === 'th' ? rule.titleTh : rule.titleEn}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t-[1px] border-[var(--ink-4)] pt-3">
                <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.confidence}</span>
                <span className="font-data text-[13px] text-[var(--ink)]">{(liveResult.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 flex-1 px-5 py-10 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
              <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest leading-relaxed">
                Analysis will appear<br />after scanning
              </span>
            </div>
          )}
        </div>

      </div>

      {/* ── Dirty-item overlay ────────────────────────────────── */}
      {dirtyAlert && (
        <div className="fixed inset-0 bg-[#1A1A1Ae6] flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-sm bg-[var(--paper)] border-[2px] border-[var(--orange)] shadow-[4px_4px_0_var(--orange)] p-6 flex flex-col gap-4">
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
          </div>
        </div>
      )}

      {/* ── Result bottom sheet — mobile swipe UX (lg:hidden) ─── */}
      {phase === 'result' && result && !dirtyAlert && (
        <div
          className="lg:hidden border-t-[1.5px] border-[var(--ink)] flex flex-col gap-3 pt-2 pb-3 px-4 bg-[var(--paper)]"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEndEvent}
        >
          <div className="w-12 h-1 bg-[var(--ink-4)] mx-auto rounded-full mb-1" />
          <p className="text-center font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest m-0 mb-2">
            {language === 'th' ? '▽ ปัดหน้าจอเพื่อเลือก' : '▽ Swipe to decide'}
          </p>

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
            <ContaminationMeter score={result.score} />
          </div>

          {result.factorScores && (
            <div className="flex flex-col gap-1 mt-1 p-2 bg-[var(--paper-2)] border-[1px] border-[var(--ink-4)]">
              <span className="font-data text-[10px] text-[var(--ink-3)] uppercase mb-1">Factor Breakdown</span>
              {Object.entries(result.factorScores).map(([factor, fscore]) => (
                <div key={factor} className="flex items-center justify-between">
                  <span className="font-data text-[10px] text-[var(--ink-2)] capitalize">{factor}</span>
                  <div className="flex items-center gap-2 w-1/2">
                    <div className="w-full h-1.5 bg-[var(--paper)] border-[1px] border-[var(--ink)]">
                      <div style={{ width: `${fscore * 10}%`, background: fscore >= 5 ? 'var(--green)' : 'var(--orange)', height: '100%' }} />
                    </div>
                    <span className="font-data text-[9px] w-6 text-right">{fscore.toFixed(1)}</span>
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

          <div className="flex items-center justify-between pt-4 pb-2 px-2 border-t-[1.5px] border-[var(--ink-4)]">
            <div
              className="flex flex-col items-center flex-1 cursor-pointer hover:bg-[var(--paper-2)] py-2 transition-colors"
              onClick={handleSwipeLeft}
            >
              <span className="font-brand text-[20px] text-[#E53E3E]">⟵</span>
              <span className="font-data text-[10px] text-[var(--ink-2)] uppercase">
                {language === 'th' ? 'ทิ้ง (Discard)' : 'Discard'}
              </span>
            </div>
            <div className="w-px h-8 bg-[var(--ink-4)]" />
            <div
              className="flex flex-col items-center flex-1 cursor-pointer hover:bg-[var(--paper-2)] py-2 transition-colors"
              onClick={handleSwipeRight}
            >
              <span className="font-brand text-[20px] text-[var(--green-ink)]">⟶</span>
              <span className="font-data text-[10px] text-[var(--ink-2)] uppercase">
                {language === 'th' ? 'ขาย (Sell)' : 'Sell'}
              </span>
            </div>
          </div>

          <Button variant="secondary" onClick={handleReset}>{t.scanAgain}</Button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  )
}
