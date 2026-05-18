import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { useResolvedName } from '../hooks/useResolvedName'
import { useUserReports } from '../hooks/useUserReports'
import { useShops } from '../hooks/useShops'
import { setAiConfig } from '../store/aiConfigSlice'
import { useModelRegistry } from '../hooks/useModelRegistry'
import { supabase } from '../lib/supabase'
import { useAdminActions } from '../hooks/useAdminActions'


function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-2 font-data text-[12px] uppercase tracking-widest border-[1.5px] border-[var(--ink)]',
        active ? 'bg-[var(--ink)] text-[var(--paper)]' : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}


// ── Model Registry UI ────────────────────────────────────────────

async function fetchTmMetadata(modelUrl) {
  try {
    const metaUrl = modelUrl.trim().replace(/model\.json(\?.*)?$/, 'metadata.json')
    const res = await fetch(metaUrl)
    if (!res.ok) return null
    const json = await res.json()
    return json.labels ?? json.classLabels ?? null
  } catch {
    return null
  }
}

function ModelRegistrySection() {
  const { files, activeByKey, loading, uploadModel, registerModelUrl, activateModel } = useModelRegistry()
  const dispatch = useDispatch()

  const [stage,       setStage]       = useState(1)
  const [materialKey, setMaterialKey] = useState('')
  const [versionTag,  setVersionTag]  = useState('')
  const [modelFile,   setModelFile]   = useState(null)
  const [metaFile,    setMetaFile]    = useState(null)
  const [tmUrl,       setTmUrl]       = useState('')
  const [uploadMode,  setUploadMode]  = useState('url')
  const [busy,        setBusy]        = useState(false)
  const [detectedLabels, setDetectedLabels] = useState(null) // string[] from metadata.json
  const [fetchingMeta,   setFetchingMeta]   = useState(false)
  const modelFileRef = useRef(null)
  const metaFileRef  = useRef(null)
  const fetchTimer   = useRef(null)

  const stage1Files = files.filter(f => f.stage === 1)
  const stage2Files = files.filter(f => f.stage === 2)

  // Derive available material types from all registered stage1 models
  const stage1Materials = [...new Set(stage1Files.flatMap(f => f.class_labels ?? []))]

  function handleUrlChange(val) {
    setTmUrl(val)
    setDetectedLabels(null)
    if (stage !== 1) return
    clearTimeout(fetchTimer.current)
    if (!val.trim()) return
    fetchTimer.current = setTimeout(async () => {
      setFetchingMeta(true)
      const labels = await fetchTmMetadata(val)
      setFetchingMeta(false)
      if (labels) setDetectedLabels(labels)
    }, 700)
  }

  async function handleRegister() {
    setBusy(true)
    try {
      if (uploadMode === 'url') {
        if (!tmUrl.trim()) { toast.error('Paste a model URL first'); return }
        await registerModelUrl({
          stage,
          materialType: stage === 2 ? materialKey : null,
          versionTag,
          modelUrl:     tmUrl.trim(),
          classLabels:  stage === 1 ? detectedLabels : null,
        })
        toast.success('Model registered' + (detectedLabels ? ` — ${detectedLabels.length} classes detected` : ''))
        setTmUrl(''); setVersionTag(''); setDetectedLabels(null)
      } else {
        if (!modelFile) { toast.error('Select model.json first'); return }
        await uploadModel({ stage, materialType: stage === 2 ? materialKey : null, versionTag, modelFile, metadataFile: metaFile })
        toast.success('Model uploaded')
        setModelFile(null); setMetaFile(null); setVersionTag('')
        if (modelFileRef.current) modelFileRef.current.value = ''
        if (metaFileRef.current) metaFileRef.current.value = ''
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleActivate(file) {
    try {
      await activateModel(file.id, file.stage, file.material_type)
      dispatch(setAiConfig(
        file.stage === 1
          ? { tmStage1Url: file.model_url, stage1ClassLabels: file.class_labels ?? [], modelVersion: file.version_tag ?? 'custom' }
          : { tmStage2Urls: { [file.material_type]: file.model_url } }
      ))
      toast.success('Model activated')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <section className="flex flex-col gap-4 pt-2">
      {/* Add Model form */}
      <Card className="flex flex-col gap-4">
        <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">Add Model</span>

        <div className="flex gap-2">
          <button onClick={() => { setStage(1); setDetectedLabels(null) }}
            className={['flex-1 py-1.5 font-data text-[11px] uppercase tracking-widest border-[1.5px]',
              stage === 1 ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]' : 'bg-transparent text-[var(--ink)] border-[var(--ink-4)] hover:border-[var(--ink)]'].join(' ')}>
            Stage 1 — Classifier
          </button>
          <button onClick={() => { setStage(2); setDetectedLabels(null) }}
            className={['flex-1 py-1.5 font-data text-[11px] uppercase tracking-widest border-[1.5px]',
              stage === 2 ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]' : 'bg-transparent text-[var(--ink)] border-[var(--ink-4)] hover:border-[var(--ink)]'].join(' ')}>
            Stage 2 — Cleanliness
          </button>
        </div>

        {stage === 2 && (
          <div className="flex flex-col gap-1">
            <select
              value={materialKey}
              onChange={e => setMaterialKey(e.target.value)}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[14px] text-[var(--ink)] outline-none"
            >
              <option value="">Select material class…</option>
              {stage1Materials.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            {stage1Materials.length === 0 && (
              <span className="font-data text-[10px] text-[var(--ink-4)]">Register a Stage 1 model first to populate this list</span>
            )}
          </div>
        )}

        <input
          type="text"
          placeholder="Version tag (e.g. v1.0-jun26)"
          value={versionTag}
          onChange={e => setVersionTag(e.target.value)}
          className="w-full px-3 py-2 border-[1.5px] border-[var(--ink-4)] bg-[var(--paper)] font-data text-[12px] text-[var(--ink)] outline-none focus:border-[var(--ink)] placeholder:text-[var(--ink-4)]"
        />

        <div className="flex gap-2">
          <button onClick={() => setUploadMode('url')}
            className={['flex-1 py-1 font-data text-[10px] uppercase tracking-widest border-[1px]',
              uploadMode === 'url' ? 'border-[var(--green)] text-[var(--green)]' : 'border-[var(--ink-4)] text-[var(--ink-4)] hover:border-[var(--ink-3)]'].join(' ')}>
            Paste URL
          </button>
          <button onClick={() => setUploadMode('file')}
            className={['flex-1 py-1 font-data text-[10px] uppercase tracking-widest border-[1px]',
              uploadMode === 'file' ? 'border-[var(--green)] text-[var(--green)]' : 'border-[var(--ink-4)] text-[var(--ink-4)] hover:border-[var(--ink-3)]'].join(' ')}>
            Upload Files
          </button>
        </div>

        {uploadMode === 'url' ? (
          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <input
                type="text"
                placeholder="https://teachablemachine.withgoogle.com/models/XXXX/model.json"
                value={tmUrl}
                onChange={e => handleUrlChange(e.target.value)}
                className="w-full px-3 py-2 border-[1.5px] border-[var(--ink-4)] bg-[var(--paper)] font-data text-[11px] text-[var(--ink)] outline-none focus:border-[var(--green)] placeholder:text-[var(--ink-4)]"
              />
              {fetchingMeta && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 font-data text-[10px] text-[var(--ink-4)] animate-pulse">reading…</span>
              )}
            </div>
            {stage === 1 && detectedLabels && (
              <div className="flex flex-col gap-0.5">
                <span className="font-data text-[10px] text-[var(--green)] uppercase tracking-widest">
                  {detectedLabels.length} classes detected
                </span>
                <span className="font-data text-[10px] text-[var(--ink-3)]">
                  {detectedLabels.join(' · ')}
                </span>
              </div>
            )}
            {stage === 1 && tmUrl && !fetchingMeta && !detectedLabels && (
              <span className="font-data text-[10px] text-[var(--ink-4)]">
                metadata.json not found — class labels will be empty until you activate and re-register
              </span>
            )}
            <span className="font-data text-[10px] text-[var(--ink-4)]">
              Teachable Machine → Export → Shareable link → copy model.json URL
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest w-20">model.json</span>
              <input ref={modelFileRef} type="file" accept=".json,application/json" className="hidden"
                onChange={e => setModelFile(e.target.files?.[0] ?? null)} />
              <button onClick={() => modelFileRef.current?.click()}
                className="px-3 py-1 font-data text-[10px] uppercase tracking-widest border-[1px] border-[var(--ink-4)] hover:border-[var(--ink)] bg-transparent text-[var(--ink-3)] cursor-pointer">
                {modelFile ? modelFile.name : '+ Select'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest w-20">metadata.json</span>
              <input ref={metaFileRef} type="file" accept=".json,application/json" className="hidden"
                onChange={e => setMetaFile(e.target.files?.[0] ?? null)} />
              <button onClick={() => metaFileRef.current?.click()}
                className="px-3 py-1 font-data text-[10px] uppercase tracking-widest border-[1px] border-[var(--ink-4)] hover:border-[var(--ink)] bg-transparent text-[var(--ink-3)] cursor-pointer">
                {metaFile ? metaFile.name : '+ Select (optional)'}
              </button>
            </div>
          </div>
        )}

        <Button variant="primary" onClick={handleRegister} disabled={busy || (stage === 2 && !materialKey)}>
          {busy ? 'Saving…' : 'Register Model'}
        </Button>
      </Card>

      {/* Registered models list */}
      {loading ? (
        <div className="h-12 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
      ) : (
        <div className="flex flex-col gap-3">
          <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">Stage 1 — Material Classifiers</span>
          {stage1Files.length === 0 && <p className="font-data text-[11px] text-[var(--ink-4)] m-0">No models yet</p>}
          {stage1Files.map(f => (
            <Card key={f.id} className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-data text-[12px] text-[var(--ink)] truncate">{f.version_tag ?? f.id.slice(0, 8)}</span>
                <span className="font-data text-[10px] text-[var(--ink-4)] truncate">{f.model_url}</span>
                {f.class_labels?.length > 0 && (
                  <span className="font-data text-[10px] text-[var(--ink-3)]">{f.class_labels.join(' · ')}</span>
                )}
                {!f.class_labels?.length && (
                  <span className="font-data text-[10px] text-[var(--orange)]">No class labels — re-register with metadata</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeByKey['__stage1__'] === f.id && (
                  <span className="font-data text-[10px] text-[var(--green)] uppercase tracking-widest">● Active</span>
                )}
                <Button variant="secondary" onClick={() => handleActivate(f)}>
                  {activeByKey['__stage1__'] === f.id ? 'Re-activate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}

          <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest mt-2">Stage 2 — Cleanliness Models (per material)</span>
          {stage2Files.length === 0 && <p className="font-data text-[11px] text-[var(--ink-4)] m-0">No models yet</p>}
          {stage2Files.map(f => (
            <Card key={f.id} className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{f.material_type}</span>
                  <span className="font-data text-[12px] text-[var(--ink)]">{f.version_tag ?? f.id.slice(0, 8)}</span>
                </div>
                <span className="font-data text-[10px] text-[var(--ink-4)] truncate">{f.model_url}</span>
              </div>
              <div className="flex items-center gap-2">
                {activeByKey[f.material_type] === f.id && (
                  <span className="font-data text-[10px] text-[var(--green)] uppercase tracking-widest">● Active</span>
                )}
                <Button variant="secondary" onClick={() => handleActivate(f)}>
                  {activeByKey[f.material_type] === f.id ? 'Re-activate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}


// ── Rider Assignment Panel ────────────────────────────────────────
function RiderAssignmentPanel() {
  const [unassigned,   setUnassigned]   = useState([])
  const [riders,       setRiders]       = useState([])
  const [assignments,  setAssignments]  = useState({}) // { [bookingId]: riderId }
  const [loadingData,  setLoadingData]  = useState(true)

  useEffect(() => {
    async function load() {
      setLoadingData(true)
      const [bookingsRes, ridersRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('id, seller_id, shop_id, materials, total_kg, created_at')
          .eq('status', 'accepted')
          .is('rider_id', null)
          .order('created_at', { ascending: true }),
        supabase
          .from('user_profiles')
          .select('id, display_name')
          .eq('role', 'rider'),
      ])
      if (bookingsRes.data) setUnassigned(bookingsRes.data)
      if (ridersRes.data)   setRiders(ridersRes.data)
      setLoadingData(false)
    }
    load()
  }, [])

  async function handleAssign(bookingId) {
    const riderId = assignments[bookingId]
    if (!riderId) return
    const { error } = await supabase
      .from('bookings')
      .update({ rider_id: riderId, status: 'in_transit' })
      .eq('id', bookingId)
    if (error) {
      toast.error('Failed to assign rider')
      return
    }
    setUnassigned(prev => prev.filter(b => b.id !== bookingId))
    setAssignments(prev => { const next = { ...prev }; delete next[bookingId]; return next })
    toast.success('Rider assigned')
  }

  if (loadingData) {
    return <div className="h-12 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
  }

  return (
    <section className="flex flex-col gap-3">
      <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">
        Unassigned Bookings ({unassigned.length})
      </span>

      {riders.length === 0 && (
        <p className="font-data text-[11px] text-[var(--ink-4)] m-0">
          No riders registered yet — add users with role&nbsp;<code>rider</code> first.
        </p>
      )}

      {unassigned.length === 0 && riders.length > 0 && (
        <div className="flex items-center justify-center py-6 border-[1.5px] border-dashed border-[var(--ink-4)]">
          <span className="font-body text-[14px] text-[var(--ink-3)]">All accepted bookings have riders assigned</span>
        </div>
      )}

      {unassigned.length > 0 && (
        <div className="flex flex-col border-[1.5px] border-[var(--ink)] px-4">
          {unassigned.map(b => (
            <div
              key={b.id}
              className="flex items-center justify-between gap-3 py-3 border-b-[1px] border-[var(--ink-4)] last:border-0"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-body text-[14px] text-[var(--ink)]">
                  {(b.materials ?? []).join(', ')} · {b.total_kg ?? '?'} kg
                </span>
                <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">
                  {new Date(b.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={assignments[b.id] ?? ''}
                  onChange={e => setAssignments(prev => ({ ...prev, [b.id]: e.target.value }))}
                  className="px-2 py-1 border-[1.5px] border-[var(--ink-4)] focus:border-[var(--ink)] bg-[var(--paper)] font-data text-[11px] outline-none"
                >
                  <option value="">Select rider…</option>
                  {riders.map(r => (
                    <option key={r.id} value={r.id}>{r.display_name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssign(b.id)}
                  disabled={!assignments[b.id]}
                  className="font-data text-[11px] uppercase tracking-widest px-3 py-1.5 bg-[var(--green)] border-[1.5px] border-[var(--ink)] text-[var(--paper)] cursor-pointer disabled:opacity-40"
                >
                  Assign
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}


// ── AI Studio Tab ─────────────────────────────────────────────────
function AiStudioTab({ aiConfig }) {
  const dispatch    = useDispatch()
  const t           = useT()
  const onnxFileRef = useRef(null)
  const [modelType, setModelType] = useState(
    aiConfig.modelType ?? 'teachable-machine'
  )

  async function handleOnnxUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    dispatch(setAiConfig({
      modelType:    'onnx',
      onnxStage1Url: url,
      modelVersion: file.name.replace(/\.onnx$/i, ''),
    }))
    toast.success(`ONNX model loaded: ${file.name}`)
  }

  function handleSelectModelType(type) {
    setModelType(type)
    dispatch(setAiConfig({ modelType: type }))
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      {/* Active version banner */}
      <Card className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.studioActiveVer}</span>
          <span className="font-data text-[13px] text-[var(--green)]">{aiConfig.modelVersion ?? '—'}</span>
        </div>
        <p className="font-body text-[13px] text-[var(--ink-3)] m-0">{t.studioHint}</p>
      </Card>

      {/* Model type selector */}
      <Card className="flex flex-col gap-3">
        <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">Backend Format</span>

        <div className="flex gap-0">
          <button
            onClick={() => handleSelectModelType('teachable-machine')}
            className={[
              'flex-1 py-2 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)]',
              modelType === 'teachable-machine'
                ? 'bg-[var(--green-soft)] text-[var(--ink)] border-r-0'
                : 'bg-[var(--paper)] text-[var(--ink-3)] hover:bg-[var(--paper-2)] border-r-0',
            ].join(' ')}
          >
            Teachable Machine
          </button>
          <button
            onClick={() => handleSelectModelType('onnx')}
            className={[
              'flex-1 py-2 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)]',
              modelType === 'onnx'
                ? 'bg-[var(--green-soft)] text-[var(--ink)]'
                : 'bg-[var(--paper)] text-[var(--ink-3)] hover:bg-[var(--paper-2)]',
            ].join(' ')}
          >
            ONNX Model
          </button>
        </div>

        {/* ONNX upload section */}
        {modelType === 'onnx' && (
          <div className="flex flex-col gap-3 pt-1">
            <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">
              Upload ONNX stage-1 classifier
            </span>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <input
                  ref={onnxFileRef}
                  type="file"
                  accept=".onnx"
                  onChange={handleOnnxUpload}
                  className="hidden"
                />
                <button
                  onClick={() => onnxFileRef.current?.click()}
                  className="px-4 py-2 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)] cursor-pointer"
                >
                  + Select .onnx file
                </button>
                {aiConfig.onnxStage1Url && (
                  <span className="font-data text-[10px] text-[var(--green)] uppercase tracking-widest">
                    ● Loaded
                  </span>
                )}
              </div>

              <label className="font-data text-[10px] text-[var(--ink-4)]">
                Upload ONNX model (.onnx) — ONNX Runtime Web stage-1 object classifier
              </label>

              {aiConfig.onnxStage1Url && (
                <div className="flex flex-col gap-0.5 mt-1">
                  <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">Active ONNX model</span>
                  <span className="font-data text-[10px] text-[var(--ink-4)] truncate max-w-xs">
                    {aiConfig.modelVersion ?? aiConfig.onnxStage1Url}
                  </span>
                </div>
              )}
            </div>

            {aiConfig.onnxStage2Url && (
              <div className="flex flex-col gap-1.5 pt-1 border-t-[1px] border-[var(--ink-4)]">
                <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">
                  Stage-2 cleanliness (ONNX)
                </span>
                <span className="font-data text-[10px] text-[var(--green)] uppercase tracking-widest">● Loaded</span>
                <span className="font-data text-[10px] text-[var(--ink-4)] truncate max-w-xs">{aiConfig.onnxStage2Url}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Teachable Machine model registry (shown when TM selected) */}
      {modelType === 'teachable-machine' && <ModelRegistrySection />}
    </div>
  )
}


export function AdminPage() {
  const t        = useT()
  const aiConfig = useSelector(s => s.aiConfig)
  const resolve  = useResolvedName()

  const { shops: allShops } = useShops()

  const darkMode = useSelector(s => s.user.darkMode)

  const [tab, setTab]               = useState('shops')
  const [pending, setPending]       = useState([])
  const [modPosts, setModPosts]     = useState([])
  const [modLoading, setModLoading] = useState(true)
  const [scanPoints, setScanPoints] = useState([])
  const [heatLoading, setHeatLoading] = useState(true)
  const [heatmapData, setHeatmapData]       = useState(null)  // { [material_type]: { count, totalKg } }
  const [heatmapLoading, setHeatmapLoading] = useState(false)

  const { reports, loading: reportsLoading, approveReport, rejectReport } = useUserReports()
  const adminActions = useAdminActions()
  const pendingCount = reports.length

  // Load pending shops on mount
  useEffect(() => {
    supabase
      .from('shops')
      .select('*, owner:owner_id(display_name)')
      .eq('status', 'pending')
      .then(({ data }) => { if (data) setPending(data) })
  }, [])

  // Load scan points for heatmap
  useEffect(() => {
    supabase
      .from('scan_history')
      .select('lat, lng, material_type, scanned_at')
      .not('lat', 'is', null)
      .order('scanned_at', { ascending: false })
      .limit(500)
      .then(({ data }) => { if (data) setScanPoints(data) })
      .finally(() => setHeatLoading(false))
  }, [])

  // Fetch scan_history material heatmap only when heatmap tab is active
  useEffect(() => {
    if (tab !== 'heatmap') return
    async function fetchHeatmap() {
      setHeatmapLoading(true)
      try {
        const { data } = await supabase
          .from('scan_history')
          .select('material_type, weight_kg')
        const agg = {}
        data?.forEach(r => {
          if (!r.material_type) return
          if (!agg[r.material_type]) agg[r.material_type] = { count: 0, totalKg: 0 }
          agg[r.material_type].count++
          agg[r.material_type].totalKg += (r.weight_kg ?? 0)
        })
        setHeatmapData(agg)
      } finally {
        setHeatmapLoading(false)
      }
    }
    fetchHeatmap()
  }, [tab])

  // Load all marketplace posts for admin moderation
  useEffect(() => {
    supabase
      .from('marketplace_posts')
      .select('*')
      .neq('status', 'removed')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setModPosts(data.map(p => ({
          id:           p.id,
          materialType: p.material_type,
          grade:        p.grade,
          qty:          p.quantity_kg,
          pricePerKg:   p.price_per_kg,
          shop:         p.user_id?.slice(0, 8) ?? '—',
          flagged:      p.flagged ?? false,
          status:       p.status,
        })))
      })
      .finally(() => setModLoading(false))
  }, [])

  async function handleApprove(id) {
    const { error } = await adminActions.approveShop(id)
    if (!error) {
      setPending(p => p.filter(s => s.id !== id))
      toast.success('Shop approved')
    } else {
      toast.error('Failed to approve shop')
    }
  }

  async function handleRejectShop(id) {
    const { error } = await adminActions.rejectShop(id)
    if (!error) {
      setPending(p => p.filter(s => s.id !== id))
      toast.error('Shop rejected')
    } else {
      toast.error('Failed to reject shop')
    }
  }

  async function handleFlag(post) {
    const next = !post.flagged
    const { error } = await adminActions.flagPost(post.id, next)
    if (!error) {
      setModPosts(ps => ps.map(p => p.id === post.id ? { ...p, flagged: next } : p))
      toast.info(next ? 'Flagged' : 'Unflagged')
    } else {
      toast.error('Update failed')
    }
  }

  async function handleRemovePost(id) {
    const { error } = await supabase
      .from('marketplace_posts')
      .update({ status: 'removed' })
      .eq('id', id)
    if (!error) {
      setModPosts(ps => ps.filter(p => p.id !== id))
      toast.error('Post removed')
    } else {
      toast.error('Remove failed')
    }
  }

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <div className="flex flex-col items-center gap-1">
        <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-[0.15em]">Platform Admin</span>
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.admin}</h1>
      </div>

      {/* Tab bar */}
      <div className="w-full max-w-2xl flex gap-2 flex-wrap">
        <TabBtn active={tab === 'shops'}      onClick={() => setTab('shops')}>{t.shopManagement}</TabBtn>
        <TabBtn active={tab === 'heatmap'}    onClick={() => setTab('heatmap')}>{t.heatmap}</TabBtn>
        <TabBtn active={tab === 'moderation'} onClick={() => setTab('moderation')}>{t.moderation}</TabBtn>
        <TabBtn active={tab === 'logistics'}  onClick={() => setTab('logistics')}>Logistics</TabBtn>
        <TabBtn active={tab === 'studio'}     onClick={() => setTab('studio')}>{t.aiStudio}</TabBtn>
        <TabBtn active={tab === 'reports'}    onClick={() => setTab('reports')}>
          {t.adminReports}{pendingCount > 0 ? ` (${pendingCount})` : ''}
        </TabBtn>
      </div>

      {/* Shops tab */}
      {tab === 'shops' && (
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.pendingApproval} ({pending.length})</span>
            {pending.length === 0 && (
              <Card className="flex items-center justify-center py-6">
                <span className="font-body text-[14px] text-[var(--ink-3)]">No pending shops</span>
              </Card>
            )}
            {pending.map(s => (
              <Card key={s.id} className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="font-body text-[15px] text-[var(--ink)] m-0 font-semibold">{s.name}</p>
                    <span className="border-[1.5px] border-[var(--orange)] text-[var(--orange)] font-data text-[10px] uppercase tracking-widest px-2 py-0.5">pending</span>
                  </div>
                  <p className="font-data text-[11px] text-[var(--ink-3)] m-0">
                    {s.owner?.display_name ?? s.owner_id?.slice(0, 8) ?? '—'}{s.area ? ` · ${s.area}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => handleApprove(s.id)}>{t.approveShop}</Button>
                  <Button variant="secondary" onClick={() => handleRejectShop(s.id)}>{t.rejectShop}</Button>
                </div>
              </Card>
            ))}
          </section>

          <section className="flex flex-col gap-3">
            <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.activeShops}</span>
            {allShops.length === 0 && (
              <p className="font-body text-[14px] text-[var(--ink-3)] m-0">—</p>
            )}
            {allShops.map(s => (
              <Card key={s.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-body text-[15px] text-[var(--ink)] m-0">{s.name}</p>
                  <span className="border-[1.5px] border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-ink)] font-data text-[10px] uppercase tracking-widest px-2 py-0.5">active</span>
                </div>
              </Card>
            ))}
          </section>
        </div>
      )}

      {/* Heatmap tab */}
      {tab === 'heatmap' && (
        <div className="w-full max-w-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
              Scan density · Chiang Mai pilot
            </span>
            <span className="font-data text-[11px] text-[var(--ink-4)]">
              {heatLoading ? 'loading…' : `${scanPoints.length} scan${scanPoints.length !== 1 ? 's' : ''} with GPS`}
            </span>
          </div>

          <div className="border-[1.5px] border-[var(--ink)] overflow-hidden" style={{ height: 420 }}>
            {heatLoading ? (
              <div className="w-full h-full bg-[var(--paper-2)] animate-pulse flex items-center justify-center">
                <span className="font-data text-[11px] text-[var(--ink-4)] uppercase tracking-widest">Loading map…</span>
              </div>
            ) : (
              <MapContainer
                center={[18.796, 98.979]}
                zoom={13}
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url={darkMode
                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}
                />
                {scanPoints.map((p, i) => (
                  <CircleMarker
                    key={i}
                    center={[p.lat, p.lng]}
                    radius={7}
                    pathOptions={{
                      color:       '#1A1A1A',
                      weight:      1,
                      fillColor:   '#22C55E',
                      fillOpacity: 0.7,
                    }}
                  >
                    <Tooltip>
                      <span className="font-data text-[11px]">
                        {p.material_type} · {new Date(p.scanned_at).toLocaleDateString()}
                      </span>
                    </Tooltip>
                  </CircleMarker>
                ))}
                {scanPoints.length === 0 && allShops.map(s => s.lat && s.lng ? (
                  <CircleMarker
                    key={s.id}
                    center={[s.lat, s.lng]}
                    radius={6}
                    pathOptions={{ color: '#1A1A1A', weight: 1, fillColor: '#F59E0B', fillOpacity: 0.6 }}
                  >
                    <Tooltip><span className="font-data text-[11px]">{s.name}</span></Tooltip>
                  </CircleMarker>
                ) : null)}
              </MapContainer>
            )}
          </div>

          {scanPoints.length === 0 && !heatLoading && (
            <p className="font-data text-[11px] text-[var(--ink-4)] m-0">
              No scans with GPS yet — showing active shop locations. Scan dots will appear as users scan with location permission enabled.
            </p>
          )}

          {/* Material-type heatmap grid */}
          <div className="flex flex-col gap-2 pt-2">
            <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
              Material breakdown · all scans
            </span>

            {heatmapLoading && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-20 border-[1.5px] border-[var(--ink-4)] bg-[var(--paper-2)] animate-pulse" />
                ))}
              </div>
            )}

            {!heatmapLoading && heatmapData && Object.keys(heatmapData).length === 0 && (
              <p className="font-data text-[11px] text-[var(--ink-4)] m-0">
                No scan data yet — grid will populate as users scan items.
              </p>
            )}

            {!heatmapLoading && heatmapData && Object.keys(heatmapData).length > 0 && (() => {
              const max = Math.max(...Object.values(heatmapData).map(v => v.totalKg))
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(heatmapData)
                    .sort(([, a], [, b]) => b.totalKg - a.totalKg)
                    .map(([mat, { count, totalKg }]) => {
                      const intensity = max > 0 ? totalKg / max : 0
                      return (
                        <div
                          key={mat}
                          className="flex flex-col gap-1 p-3 border-[1.5px] border-[var(--ink)]"
                          style={{
                            background: intensity > 0.66
                              ? 'var(--green)'
                              : intensity > 0.33
                              ? 'var(--green-soft)'
                              : 'var(--paper-2)',
                          }}
                        >
                          <span className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-3)]">
                            {mat.replace(/_/g, ' ')}
                          </span>
                          <span className="font-brand text-[22px] text-[var(--ink)] leading-none">
                            {totalKg.toFixed(1)}
                          </span>
                          <span className="font-data text-[9px] text-[var(--ink-3)] uppercase tracking-widest">
                            {count} scans · kg
                          </span>
                        </div>
                      )
                    })}
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Logistics tab */}
      {tab === 'logistics' && (
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <RiderAssignmentPanel />
        </div>
      )}

      {/* AI Studio tab */}
      {tab === 'studio' && (
        <AiStudioTab aiConfig={aiConfig} />
      )}


      {/* Moderation tab */}
      {tab === 'moderation' && (
        <div className="w-full max-w-2xl flex flex-col gap-4">
          <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">
            {t.moderation} ({modPosts.length} {t.totalPosts})
          </span>

          {modLoading && (
            <div className="h-12 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
          )}

          {!modLoading && modPosts.length === 0 && (
            <Card className="flex items-center justify-center py-8">
              <p className="font-body text-[15px] text-[var(--ink-3)] m-0">{t.noListings}</p>
            </Card>
          )}

          <div className="flex flex-col gap-3">
            {modPosts.map(post => (
              <Card
                key={post.id}
                className={`flex flex-col gap-2 ${post.flagged ? 'border-[var(--orange)]' : ''}`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <GradeTag clean={post.grade !== 'C'} />
                    <span className="font-body text-[15px] text-[var(--ink)]">
                      {resolve(post.materialType)}
                    </span>
                    <span className="font-data text-[12px] text-[var(--ink-3)]">{post.qty}kg · ฿{post.pricePerKg}/kg</span>
                  </div>
                  {post.flagged && (
                    <span className="font-data text-[10px] text-[var(--orange)] uppercase tracking-widest">flagged</span>
                  )}
                </div>
                <span className="font-body text-[13px] text-[var(--ink-3)]">{post.shop}</span>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant={post.flagged ? 'primary' : 'secondary'}
                    onClick={() => handleFlag(post)}
                  >
                    {post.flagged ? t.unflagPost : t.flagPost}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleRemovePost(post.id)}
                  >
                    {t.removePostLabel}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reports tab */}
      {tab === 'reports' && (
        <div className="w-full max-w-2xl flex flex-col gap-4">
          <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">
            {t.pendingReports} ({pendingCount})
          </span>

          {reportsLoading && (
            <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest animate-pulse self-center">
              Loading...
            </span>
          )}

          {!reportsLoading && reports.length === 0 && (
            <Card className="flex items-center justify-center py-8">
              <p className="font-body text-[15px] text-[var(--ink-3)] m-0">{t.noReports}</p>
            </Card>
          )}

          {reports.map(report => (
            <Card key={report.id} className="flex flex-col gap-3">
              <div className="flex items-start gap-3 flex-wrap">
                {report.scan_image_url && (
                  <img
                    src={report.scan_image_url}
                    alt="scan"
                    className="w-16 h-16 object-cover border-[1.5px] border-[var(--ink)]"
                  />
                )}
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Claimed</span>
                    <span className="font-body text-[14px] text-[var(--ink)]">{resolve(report.claimed_material)}</span>
                  </div>
                  {report.ai_material && (
                    <div className="flex items-center gap-2">
                      <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">AI said</span>
                      <span className="font-body text-[13px] text-[var(--ink-2)]">{resolve(report.ai_material)}</span>
                      {report.ai_grade != null && <GradeTag clean={report.ai_grade !== 'C'} />}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Reporter</span>
                    <span className="font-data text-[12px] text-[var(--ink-2)]">
                      {report.reporter_id ? report.reporter_id.slice(0, 8) : 'anonymous'}
                    </span>
                  </div>
                  <span className="font-data text-[10px] text-[var(--ink-4)]">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="primary"
                  onClick={() => approveReport(report.id, report.claimed_material)}
                >
                  {t.approveAsLabel} {resolve(report.claimed_material)}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => rejectReport(report.id, '')}
                >
                  {t.rejectShop}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
