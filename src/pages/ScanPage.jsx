import { useRef, useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { pricePerKg, localName, WASTE_ITEMS } from '../data/wasteItems'
import { useResolvedName } from '../hooks/useResolvedName'
import { getRulesFor, SEVERITY_COLOR } from '../data/wasteRules'
import { addToBasket, setLastScan } from '../store/wasteSlice'
import { twoStageInfer } from '../services/twoStageAI'
import { useScanInsert } from '../hooks/useScanInsert'
import { useReportActions } from '../hooks/useReportActions'

/* ── Batch queue item row ────────────────────────────────────── */
function QueueRow({ item, onRemove }) {
  const resolve   = useResolvedName()
  const unitPrice = pricePerKg(item.materialType, item.clean ?? true)
  return (
    <div className="flex items-center justify-between py-2.5 border-b-[1px] border-[var(--ink-4)] last:border-b-0">
      <span className="font-body text-[14px] text-[var(--ink)] truncate flex-1 min-w-0">
        {resolve(item.materialType)}
      </span>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <GradeTag clean={item.clean} />
        <span className="font-data text-[12px] text-[var(--green)]">฿{unitPrice.toFixed(0)}/kg</span>
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
  const userId   = useSelector(s => s.user.session?.user?.id ?? null)
  const resolve  = useResolvedName()
  const videoRef  = useRef(null)
  const streamRef = useRef(null)
  const fileRef   = useRef(null)
  const insertScan    = useScanInsert()
  const reportActions = useReportActions()

  const uploadImgRef = useRef(null)   // holds Image element for re-scan in upload mode

  const [phase, setPhase]                   = useState('starting')
  const [result, setResult]                 = useState(null)
  const [pendingItem, setPendingItem]       = useState(null)  // dirty item awaiting confirmation
  const [uploadSrc, setUploadSrc]           = useState(null)
  const [inputMode, setInputMode]           = useState('camera')
  const [, setHasStream]                    = useState(false)
  const [dirtyAlert, setDirtyAlert]         = useState(false)
  const [batchMode, setBatchMode]           = useState(false)
  const [batchQueue, setBatchQueue]         = useState([])
  const [showReport, setShowReport]         = useState(false)
  const [reportMaterial, setReportMaterial] = useState(Object.keys(WASTE_ITEMS)[0])

  const [flashOn, setFlashOn]               = useState(false)
  const [cameras, setCameras]               = useState([])
  const [cameraIdx, setCameraIdx]           = useState(0)
  const [bbox, setBbox]                     = useState(null)
  const [cleanlinessScore, setCleanlinessScore] = useState(null)
  const [stage, setStage]                   = useState(null)

  const [isDragging, setIsDragging]  = useState(false)

  const [editedWeight, setEditedWeight] = useState('')

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
    if (!result) return
    const weight = Math.max(0.01, parseFloat(editedWeight) || result.weight || 0.5)
    // eslint-disable-next-line react-hooks/purity
    const item = { ...result, id: `${result.materialType}_${Date.now()}`, weight }
    if (result.stage2Pass === false) {
      setPendingItem(item)
      setDirtyAlert(true)
    } else {
      setBatchQueue(q => [...q, item])
      toast.success(`+ ${resolve(result.materialType)}`, { duration: 1500 })
      handleReset()
    }
  }

  function handleSwipeLeft() {
    toast('Discarded item')
    handleReset()
  }

  const isMockMode = !aiConfig.yoloStage1Url && !aiConfig.tmStage1Url && !aiConfig.onnxStage1Url && !aiConfig.vertexStage1Endpoint
  const aiMode     = aiConfig.yoloStage1Url ? 'yolo' : aiConfig.tmStage1Url ? 'tfjs' : aiConfig.onnxStage1Url ? 'onnx' : aiConfig.vertexStage1Endpoint ? 'vertex' : 'demo'
  const activeBasket = basket.filter(i => !i.skipped)
  const basketTotal  = activeBasket.reduce((s, i) => s + pricePerKg(i.materialType, i.clean ?? true) * (i.weight ?? 0), 0)
  const queueTotal   = batchQueue.reduce((s, i) => s + pricePerKg(i.materialType, i.clean ?? true) * (i.weight ?? 0), 0)
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

  // Enumerate cameras once on mount
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices()
      .then(devices => setCameras(devices.filter(d => d.kind === 'videoinput')))
      .catch(() => {})
  }, [])

  // Cleanup camera on unmount only
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setHasStream(false)
    if (videoRef.current) videoRef.current.srcObject = null
  }

  /* ── Flash control ───────────────────────────────────────── */
  async function handleToggleFlash() {
    const track = videoRef.current?.srcObject?.getVideoTracks?.()?.[0]
    if (!track) return
    const caps = track.getCapabilities?.()
    if (!caps?.torch) { toast.info('Flash not supported on this device'); return }
    const next = !flashOn
    try {
      await track.applyConstraints({ advanced: [{ torch: next }] })
      setFlashOn(next)
    } catch {
      toast.info('Flash not available')
    }
  }

  /* ── Camera switch ────────────────────────────────────────── */
  async function handleSwitchCamera() {
    if (cameras.length < 2) { toast.info('No other camera found'); return }
    const nextIdx = (cameraIdx + 1) % cameras.length
    setCameraIdx(nextIdx)
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: cameras[nextIdx].deviceId } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch {
      toast.info('Could not switch camera')
    }
  }

  /* ── Inference ────────────────────────────────────────────── */
  async function runInference(source) {
    if (isMockMode) {
      const msg = language === 'th'
        ? 'AI ยังไม่พร้อมใช้บริการ — ยังไม่ได้ตั้งค่าโมเดล'
        : 'AI not ready — no model configured'
      toast.error(msg, { duration: 4000 })
      setPhase(streamRef.current ? 'idle' : 'starting')
      return
    }
    setBbox(null)
    setCleanlinessScore(null)
    setStage(1)
    setPhase('analyzing')
    try {
      const infer = await twoStageInfer(source, {
        confidenceThreshold:  aiConfig.confidenceThreshold,
        yoloStage1Url:        aiConfig.yoloStage1Url      || null,
        yoloClassLabels:      aiConfig.yoloClassLabels    ?? [],
        tmStage1Url:          aiConfig.tmStage1Url        || null,
        stage1ClassLabels:    aiConfig.stage1ClassLabels  ?? [],
        tmStage2Urls:         aiConfig.tmStage2Urls       ?? {},
        onnxStage1Url:        aiConfig.onnxStage1Url      || null,
        onnxStage2Url:        aiConfig.onnxStage2Url      || null,
        vertexStage1Endpoint: aiConfig.vertexStage1Endpoint || null,
        vertexStage2Endpoint: aiConfig.vertexStage2Endpoint || null,
      })
      setStage(2)
      if (infer.noDetection) {
        setStage(null)
        toast.error(
          language === 'th'
            ? 'ตรวจไม่พบวัตถุ — ลองปรับมุมกล้องหรือแสงสว่าง'
            : 'No object detected — try adjusting the angle or lighting',
          { duration: 3000 }
        )
        setPhase(streamRef.current ? 'idle' : 'starting')
        return
      }
      if (infer.troll || infer.lowConfidence) { setStage(null); setPhase('troll'); return }

      // Multi-object path: YOLO returned several detections at once
      if (infer.multiResult) {
        const newItems = infer.multiResult.map(r => ({
          id:              crypto.randomUUID(),
          materialType:    r.materialType,
          weight:          r.weight,
          clean:           r.stage2Pass,
          confidence:      r.confidence,
          source:          r.source,
          bbox:            r.bbox,
          cleanlinessScore: r.cleanlinessScore ?? null,
        }))

        // Always update Live Analysis with the first (highest-confidence) detection
        const first = infer.multiResult[0]
        setResult(first)
        setEditedWeight(String(first.weight ?? 0.5))
        setBbox(first.bbox ?? null)
        setCleanlinessScore(first.cleanlinessScore ?? null)
        setStage(null)
        dispatch(setLastScan(first))
        navigator.vibrate?.(100)

        // Single dirty item in normal scan mode → trigger dirty popup
        if (!batchMode && newItems.length === 1 && newItems[0].clean === false) {
          setPendingItem(newItems[0])
          setDirtyAlert(true)
          setPhase('result')
          return
        }

        setBatchQueue(prev => [...prev, ...newItems])
        toast.success(
          newItems.length > 1
            ? `Detected ${newItems.length} items`
            : `+ ${resolve(newItems[0].materialType)}`,
          { duration: 1500 }
        )
        setPhase(streamRef.current ? 'idle' : 'starting')
        return
      }

      navigator.vibrate?.(100)
      setResult(infer)
      setEditedWeight(String(infer.weight ?? 0.5))
      setBbox(infer.bbox ?? null)
      setCleanlinessScore(infer.cleanlinessScore ?? null)
      setStage(null)
      dispatch(setLastScan(infer))

      // Always accumulate in batch queue; dirty items need user confirmation first
      const item = { ...infer, id: `${infer.materialType}_${Date.now()}` }
      if (infer.stage2Pass === false) {
        setPendingItem(item)
        setDirtyAlert(true)
        setPhase('result')
      } else {
        setBatchQueue(q => [...q, item])
        toast.success(`+ ${resolve(infer.materialType)}`, { duration: 1500 })
        setPhase(streamRef.current ? 'idle' : 'starting')
      }
    } catch (err) {
      console.error('[Scan] inference error:', err)
      setStage(null)
      const msg = language === 'th'
        ? 'AI ขัดข้อง — กรุณาลองใหม่อีกครั้ง'
        : 'AI error — please try again'
      toast.error(msg, { duration: 4000 })
      setPhase(streamRef.current ? 'idle' : 'starting')
    }
  }

  async function handleScan() {
    if (inputMode === 'upload' && uploadImgRef.current) {
      await runInference(uploadImgRef.current)
    } else if (videoRef.current) {
      await runInference(videoRef.current)
    }
  }

  async function handleFile(file) {
    if (!file) return
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setHasStream(false)
    const url = URL.createObjectURL(file)
    setUploadSrc(url)
    setInputMode('upload')
    setPhase('idle')
    const img = new window.Image()
    img.onload  = () => { uploadImgRef.current = img; runInference(img) }
    img.onerror = () => { toast.error('Could not load image'); setPhase('idle') }
    img.src = url
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    await handleFile(file)
  }

  /* ── Report misidentification ─────────────────────────────── */
  async function handleSubmitReport() {
    await reportActions.submitReport({
      claimedMaterial: reportMaterial,
      aiMaterial:      result?.materialType,
      aiClean:         result?.stage2Pass,
      userId,
    })
    toast.success(t.reportSuccess)
    setShowReport(false)
  }

  /* ── Queue / basket actions ───────────────────────────────── */
  function handleConfirmClean() {
    const item = pendingItem
    setDirtyAlert(false)
    setPendingItem(null)
    if (!item) { handleReset(); return }
    navigator.vibrate?.(50)
    setBatchQueue(q => [...q, item])
    toast.success(`+ ${resolve(item.materialType)}`, { duration: 1500 })
    // stay in camera idle if camera is running, else go back to starting
    setPhase(streamRef.current ? 'idle' : 'starting')
  }

  function handleRejectClean() {
    setDirtyAlert(false)
    setPendingItem(null)
    toast.error(language === 'th' ? 'กรุณาทำความสะอาดก่อนนำมาขาย' : 'Please wash it before selling')
    setPhase(streamRef.current ? 'idle' : 'starting')
  }

  function handleAddBatch() {
    if (batchQueue.length === 0) return
    batchQueue.forEach(item => {
      dispatch(addToBasket({ id: item.id, materialType: item.materialType, clean: item.stage2Pass ?? true, weight: item.weight, pricePerKg: pricePerKg(item.materialType, item.stage2Pass ?? true) }))
      insertScan(item)
    })
    toast.success(language === 'th' ? `เพิ่ม ${batchQueue.length} รายการลงตะกร้าแล้ว` : `${batchQueue.length} items added to basket`)
    setBatchQueue([])
  }

  function handleRemoveFromQueue(id) {
    setBatchQueue(q => q.filter(i => i.id !== id))
  }

  function handleReset() {
    if (uploadSrc) URL.revokeObjectURL(uploadSrc)
    setUploadSrc(null)
    uploadImgRef.current = null
    setResult(null)
    setEditedWeight('')
    setBbox(null)
    setCleanlinessScore(null)
    setStage(null)
    setDirtyAlert(false)
    setInputMode('camera')
    setPhase('starting')
  }

  /* ── Derived values for live analysis panel ─────────── */
  const liveResult = result
  const liveValue  = liveResult ? pricePerKg(liveResult.materialType, liveResult.stage2Pass ?? true) * liveResult.weight : 0

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
              {language === 'th' ? 'สแกนขยะรีไซเคิล' : 'Scan Recyclables'}
            </h1>
            <p className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest m-0 mt-1">
              {language === 'th'
                ? 'มือถือ: เปิดกล้อง → ถ่ายรูป · Desktop: อัปโหลดรูป'
                : 'Mobile: open camera → capture · Desktop: upload image'}
            </p>
          </div>

          {/* Camera controls */}
          <div className="flex items-center gap-3 px-6 lg:px-8 py-3 border-b-[1.5px] border-[var(--ink)] bg-[var(--paper-2)]">
            <button
              onClick={handleToggleFlash}
              className={`font-data text-[11px] border-[1.5px] px-2.5 py-1 bg-transparent cursor-pointer flex items-center gap-1.5 transition-colors ${
                flashOn
                  ? 'border-[var(--orange)] text-[var(--orange)]'
                  : 'border-[var(--ink-4)] text-[var(--ink-3)] hover:border-[var(--ink)] hover:text-[var(--ink)]'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              {flashOn ? 'flash ON' : 'flash ▾'}
            </button>
            <button
              onClick={handleSwitchCamera}
              className="font-data text-[11px] text-[var(--ink-3)] border-[1.5px] border-[var(--ink-4)] px-2.5 py-1 bg-transparent cursor-pointer hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors"
            >
              camera {cameraIdx + 1}/{Math.max(cameras.length, 1)} ▾
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
                {aiMode}
              </span>
            </div>
          </div>

          {/* AI not ready banner */}
          {isMockMode && (
            <div className="px-6 lg:px-8 py-3 border-b-[1.5px] border-[#E53E3E] bg-[rgba(229,62,62,0.07)] flex items-center gap-3">
              <span className="font-data text-[9px] border-[1.5px] border-[#E53E3E] text-[#E53E3E] px-1.5 py-0.5 uppercase tracking-widest shrink-0">
                {language === 'th' ? 'ยังไม่พร้อม' : 'NOT READY'}
              </span>
              <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-wide">
                {language === 'th'
                  ? 'AI ยังไม่พร้อมใช้บริการ — โมเดลยังไม่ได้โหลด'
                  : 'AI not ready — model not loaded yet'}
              </span>
            </div>
          )}

          {/* Viewfinder */}
          <div className="px-6 lg:px-8 py-5 flex flex-col gap-4 flex-1">
            <div
              className="relative w-full aspect-video bg-[var(--ink)] overflow-hidden"
              style={{
                border: isDragging
                  ? '2px dashed var(--green)'
                  : '1.5px solid var(--ink)',
                background: isDragging ? 'var(--green-soft)' : undefined,
              }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(false)
                const file = e.dataTransfer.files?.[0]
                if (file && file.type.startsWith('image/')) {
                  handleFile(file)
                }
              }}
            >
              {inputMode === 'camera'
                ? <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                : uploadSrc && <img src={uploadSrc} alt="scan" className="w-full h-full object-contain bg-[var(--paper-2)]" />
              }

              {/* Corner guides */}
              {inputMode === 'camera' && (phase === 'idle' || phase === 'analyzing') && (
                <>
                  <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[var(--green)]" />
                  <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[var(--green)]" />
                  <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[var(--green)]" />
                  <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[var(--green)]" />
                </>
              )}

              {/* Laser scan line */}
              {phase === 'analyzing' && (
                <div className="absolute left-0 right-0 h-[1.5px] bg-[var(--green)] scan-laser pointer-events-none"
                  style={{ boxShadow: '0 0 6px 1px rgba(34,197,94,0.55)' }} />
              )}

              {/* Stage indicator — shows during analysis */}
              {stage && (
                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-[var(--paper)] border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] z-10">
                  <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
                  <span className="font-data text-[11px] uppercase tracking-widest">Stage {stage}</span>
                  <span className="font-data text-[10px] text-[var(--ink-3)]">
                    {stage === 1 ? '— detecting material' : '— checking cleanliness'}
                  </span>
                </div>
              )}

              {/* Bounding box overlay — real normalized coordinates from YOLO */}
              {bbox && (
                <div
                  className="absolute pointer-events-none border-2 border-[#5BC0BE]"
                  style={{
                    left:      `${bbox.x1 * 100}%`,
                    top:       `${bbox.y1 * 100}%`,
                    width:     `${(bbox.x2 - bbox.x1) * 100}%`,
                    height:    `${(bbox.y2 - bbox.y1) * 100}%`,
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.15)',
                  }}
                >
                  <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5BC0BE]" />
                  <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#5BC0BE]" />
                  <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#5BC0BE]" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#5BC0BE]" />
                  {result && (
                    <div className="absolute px-1.5 py-0.5 bg-[#5BC0BE]" style={{ bottom: '-22px', left: 0 }}>
                      <span className="font-data text-[9px] text-[var(--paper)] uppercase tracking-widest">
                        {resolve(result.materialType)} · {(result.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {phase === 'starting' && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-5"
                  style={{ background: isDragging ? 'var(--green-soft)' : 'var(--paper-2)' }}
                >
                  {isDragging ? (
                    <span className="font-data text-[13px] text-[var(--green)] uppercase tracking-[0.2em]">
                      DROP IMAGE HERE
                    </span>
                  ) : (
                    <>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <button
                        onClick={startCamera}
                        className="lg:hidden font-data text-[12px] uppercase tracking-widest border-[2px] border-[var(--ink)] px-6 py-3 bg-[var(--green)] text-[var(--paper)] shadow-[3px_3px_0_var(--ink)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all cursor-pointer"
                      >
                        {language === 'th' ? 'เปิดกล้อง' : 'Open Camera'}
                      </button>
                      <span className="hidden lg:block font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">
                        {language === 'th' ? 'อัปโหลดรูปหรือลากมาวาง' : 'Upload or drag & drop image here'}
                      </span>
                    </>
                  )}
                </div>
              )}

              {phase === 'analyzing' && (
                <div className="absolute inset-0 bg-[#062040cc] flex flex-col items-center justify-center gap-3">
                  <span className="font-data text-[13px] text-[var(--green)] uppercase tracking-widest animate-pulse">{t.analyzing}</span>
                  <span className="font-data text-[9px] text-[var(--green-soft)] uppercase tracking-widest opacity-60">
                    {isMockMode ? 'gp-vision-demo' : 'gp-vision-2.1'}
                  </span>
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

              {isDragging && phase !== 'starting' && (
                <div className="absolute inset-0 flex items-center justify-center z-20"
                  style={{ background: 'var(--green-soft)', border: '2px dashed var(--green)' }}>
                  <span className="font-data text-[13px] text-[var(--green)] uppercase tracking-[0.2em]">
                    DROP IMAGE HERE
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
                <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.lowConfidenceTitle}</span>
                <p className="font-body text-[14px] text-[var(--ink-3)] m-0 text-center">{t.lowConfidenceHint}</p>
                <Button variant="secondary" onClick={handleReset}>{t.scanAgain}</Button>
              </div>
            )}

            {/* Scan controls */}
            <div className="flex flex-col gap-2">
              {/* Starting: open camera (mobile) */}
              {phase === 'starting' && (
                <div className="flex gap-2">
                  <Button variant="primary" fullWidth onClick={startCamera} className="lg:hidden">
                    {language === 'th' ? '📷 เปิดกล้อง' : '📷 Open Camera'}
                  </Button>
                  <Button variant="secondary" fullWidth onClick={() => fileRef.current?.click()}>
                    {language === 'th' ? 'อัปโหลดรูป' : 'Upload Image'}
                  </Button>
                </div>
              )}

              {/* Camera idle: capture button */}
              {phase === 'idle' && inputMode === 'camera' && (
                <div className="flex gap-2">
                  <Button variant="primary" fullWidth onClick={handleScan}>
                    {language === 'th' ? '📷 ถ่ายรูปเพื่อสแกน' : '📷 Capture & Scan'}
                  </Button>
                  <button
                    onClick={() => { stopCamera(); setPhase('starting') }}
                    className="font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink-4)] px-3 py-2 bg-transparent text-[var(--ink-3)] cursor-pointer hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors shrink-0"
                  >
                    {language === 'th' ? 'ปิด' : 'Close'}
                  </button>
                </div>
              )}

              {/* Analyzing */}
              {phase === 'analyzing' && (
                <div className="flex items-center justify-center gap-2.5 py-2.5 border-[1.5px] border-[var(--green)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
                  <span className="font-data text-[11px] text-[var(--green)] uppercase tracking-widest">
                    {language === 'th' ? 'กำลังวิเคราะห์…' : 'Analyzing…'}
                  </span>
                </div>
              )}

              {/* Upload mode re-scan */}
              {phase === 'idle' && inputMode === 'upload' && (
                <Button variant="secondary" fullWidth onClick={handleScan}>
                  {language === 'th' ? 'สแกนอีกครั้ง' : 'Re-scan'}
                </Button>
              )}

              {phase === 'result' && liveResult && (
                <>
                  <div className="flex gap-3">
                    <Button variant="secondary" fullWidth onClick={handleReset}>{t.scanAgain}</Button>
                  </div>
                  {!showReport ? (
                    <button
                      type="button"
                      onClick={() => setShowReport(true)}
                      className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-4)] hover:text-[var(--orange)] bg-transparent border-none cursor-pointer py-1 self-start transition-colors"
                    >
                      {t.reportIssue}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2 border-[1.5px] border-[var(--orange)] p-3">
                      <span className="font-data text-[11px] text-[var(--orange)] uppercase tracking-widest">{t.reportTitle}</span>
                      <span className="font-body text-[13px] text-[var(--ink-3)]">{t.reportHint}</span>
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
                        <Button variant="secondary" onClick={handleSubmitReport}>{t.reportSubmit}</Button>
                        <button type="button" onClick={() => setShowReport(false)} className="font-data text-[11px] uppercase tracking-widest text-[var(--ink-3)] bg-transparent border-none cursor-pointer hover:text-[var(--ink)] transition-colors">
                          {t.reportCancel}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center gap-4">
                {phase !== 'starting' && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-4)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer py-1 transition-colors"
                  >
                    {language === 'th' ? 'หรืออัปโหลดรูป' : 'or upload image'}
                  </button>
                )}
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
                <QueueRow key={item.id} item={item} onRemove={handleRemoveFromQueue} />
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
            {stage ? (
              <span className="font-data text-[9px] border-[1.5px] border-[var(--green)] text-[var(--green)] px-1.5 py-0.5 uppercase tracking-widest animate-pulse">
                STAGE {stage} / 2
              </span>
            ) : liveResult ? (
              <span className="font-data text-[9px] border-[1.5px] border-[var(--green)] text-[var(--green)] px-1.5 py-0.5 uppercase tracking-widest">
                STAGE 2 / 2
              </span>
            ) : null}
          </div>

          {liveResult ? (
            <div className="flex flex-col gap-5 px-5 py-5">
              <div className="flex flex-col gap-1">
                <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">Detected</span>
                <div className="flex items-center gap-2">
                  <GradeTag clean={liveResult.stage2Pass} />
                  <span className="font-brand text-[18px] text-[var(--ink)] leading-tight">
                    {resolve(liveResult.materialType)}
                  </span>
                  {liveResult.source === 'mock' && (
                    <span className="font-data text-[9px] text-[var(--ink-4)] border border-[var(--ink-4)] px-1 py-0.5 uppercase">demo</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">Estimated value</span>
                <div className="border-[1.5px] border-[var(--ink)] p-3 flex flex-col gap-2 bg-[var(--paper-2)]">
                  <div className="font-data text-[11px] text-[var(--ink-3)]">
                    {liveResult.weight}kg
                    <span className="text-[var(--ink-4)] mx-1">×</span>
                    ฿{pricePerKg(liveResult.materialType, liveResult.stage2Pass ?? true).toFixed(0)}/kg
                  </div>
                  <div className="font-brand text-[28px] text-[var(--ink)] leading-none">
                    ฿ {liveValue.toFixed(2)}
                  </div>
                  <div className="font-data text-[13px] text-[var(--green-ink)]">
                    + {Math.max(1, Math.round((liveResult.weight ?? 0.5) * 10))} impact pts
                  </div>
                </div>
              </div>

              {getRulesFor(liveResult.materialType).length > 0 && (
                <div className="flex flex-col gap-2 border-t-[1px] border-[var(--ink-4)] pt-3">
                  <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-[0.15em]">
                    {t.handlingGuide}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {getRulesFor(liveResult.materialType).map((rule, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="font-data text-[10px] shrink-0 leading-relaxed" style={{ color: SEVERITY_COLOR[rule.severity] }}>
                          {rule.severity === 'reject' ? '✕' : rule.severity === 'warning' ? '!' : rule.severity === 'dispose' ? '♻' : '·'}
                        </span>
                        <p className="font-data text-[10px] m-0 leading-relaxed" style={{ color: SEVERITY_COLOR[rule.severity] }}>
                          {language === 'th' ? rule.titleTh : rule.titleEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t-[1px] border-[var(--ink-4)] pt-3">
                <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.confidence}</span>
                <span className="font-data text-[13px] text-[var(--ink)]">{(liveResult.confidence * 100).toFixed(0)}%</span>
              </div>

              {cleanlinessScore !== null && (
                <div className="border-t-[1px] border-[var(--ink-4)] pt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-3)]">Cleanliness</span>
                    <span
                      className="font-data text-[12px] font-bold"
                      style={{ color: cleanlinessScore >= 60 ? 'var(--green-ink)' : 'var(--orange)' }}
                    >
                      {cleanlinessScore}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-[var(--paper-2)] border-[1.5px] border-[var(--ink)] overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width:      `${cleanlinessScore}%`,
                        background: cleanlinessScore >= 60 ? 'var(--green)' : 'var(--orange)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="font-data text-[9px] text-[var(--ink-4)]">dirty</span>
                    <span className="font-data text-[9px] text-[var(--ink-4)]">clean</span>
                  </div>
                </div>
              )}
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
              <GradeTag clean={result.stage2Pass} />
              <span className="font-body text-[17px] text-[var(--ink)] font-semibold">
                {resolve(result.materialType)}
              </span>
            </div>
            {(result.source === 'mock' || result.source === 'mock-fallback') && (
              <span className="font-data text-[9px] text-[var(--ink-4)] border border-[var(--ink-4)] px-1.5 py-0.5 uppercase">demo</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-[1px] border-[var(--ink-4)] p-3">
            <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">{t.estWeight}</span>
            <div className="flex items-center gap-1.5 justify-end">
              <input
                type="number"
                min="0.01"
                step="0.1"
                value={editedWeight}
                onChange={e => setEditedWeight(e.target.value)}
                className="w-16 font-data text-[13px] text-[var(--ink)] text-right border-b-[1.5px] border-[var(--green)] bg-transparent outline-none"
                aria-label="Weight kg"
              />
              <span className="font-data text-[11px] text-[var(--ink-3)]">kg</span>
            </div>
            <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">฿/kg</span>
            <span className="font-data text-[13px] text-[var(--ink)] text-right">
              ฿{pricePerKg(result.materialType, result.stage2Pass ?? true).toFixed(2)}
            </span>
            <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Total</span>
            <span className="font-data text-[14px] text-[var(--green)] font-bold text-right">
              ฿{(pricePerKg(result.materialType, result.stage2Pass ?? true) * (parseFloat(editedWeight) || result.weight || 0)).toFixed(2)}
            </span>
          </div>

          {result && (
            <span className="font-data text-[13px] text-[var(--green-ink)]">
              +{Math.max(1, Math.round((result.weight_kg ?? result.weight ?? 0.5) * 10))} impact pts
            </span>
          )}

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
