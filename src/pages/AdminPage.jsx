import { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { classifyWaste } from '../services/secondBrain'
import { setAiConfig } from '../store/aiConfigSlice'
import { removePost, flagPost } from '../store/marketplaceSlice'
import { WASTE_ITEMS, localName } from '../data/wasteItems'
import { supabase } from '../lib/supabase'
import { useUserReports } from '../hooks/useUserReports'

const PENDING_SHOPS = [
  { id: 1, name: 'สยาม รีไซเคิล', owner: 'สมชาย ใจดี',    area: 'นิมมานเหมินท์' },
  { id: 2, name: 'ECO Green CM',   owner: 'Napat Kanjana', area: 'สันทราย'       },
  { id: 3, name: 'วัฒนา ของเก่า',  owner: 'วัฒนา สุขใจ',  area: 'หางดง'         },
]

const ACTIVE_SHOPS = [
  { id: 4, name: 'เฮียอ้วน รีไซเคิล', area: 'นิมมานเหมินท์', scans: 342 },
  { id: 5, name: 'แม่น้อย ของเก่า',   area: 'ช้างเผือก',     scans: 218 },
  { id: 6, name: 'ร้านบุญชู',          area: 'สุเทพ',          scans: 189 },
  { id: 7, name: 'กรีน พอยท์ CM',     area: 'ป่าตัน',         scans: 95  },
]

const HEATMAP_DATA = [
  [80, 60, 40, 20, 10, 15, 30, 50, 70, 85],
  [65, 90, 55, 35, 25, 20, 40, 60, 75, 60],
  [45, 70, 95, 80, 60, 45, 55, 70, 50, 40],
  [30, 50, 75, 100, 85, 70, 60, 45, 35, 25],
  [20, 35, 55, 80, 90, 75, 55, 40, 30, 20],
  [15, 25, 40, 60, 70, 65, 50, 35, 25, 15],
  [25, 40, 55, 70, 65, 55, 45, 30, 20, 15],
  [35, 50, 65, 75, 60, 50, 40, 30, 25, 20],
  [45, 60, 70, 65, 55, 45, 35, 25, 20, 15],
  [55, 65, 60, 50, 40, 35, 30, 25, 15, 10],
]

const DISTRICTS = ['นิมมาน', 'ช้างเผือก', 'สุเทพ', 'ป่าตัน', 'หางดง', 'สันทราย', 'แม่ริม', 'สันกำแพง', 'ดอยสะเก็ด', 'สารภี']

const MODEL_OPTIONS = [
  { value: 'mock',                   label: 'Mock Inference (current)' },
  { value: 'claude-haiku-4-5',       label: 'Claude claude-haiku-4-5 (API)' },
  { value: 'claude-sonnet-4-6',      label: 'Claude claude-sonnet-4-6 (API)' },
]

function heatColor(v) {
  if (v >= 80) return 'var(--orange)'
  if (v >= 50) return 'var(--green-soft, #C8F5D8)'
  return 'var(--paper-2)'
}

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

const MATERIAL_KEYS = Object.keys(WASTE_ITEMS)

function ClassUploadCard({ materialKey, label, count, enough, uploading, onFiles, t }) {
  const fileRef = useRef(null)

  function handleFiles(e) {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) onFiles(materialKey, files)
    e.target.value = ''
  }

  return (
    <div
      className={[
        'flex flex-col gap-2 p-3 border-[1.5px]',
        enough ? 'border-[var(--green)]' : 'border-[var(--ink-4)]',
        'bg-[var(--paper)]',
      ].join(' ')}
    >
      <span className="font-body text-[13px] text-[var(--ink)] font-semibold truncate">{label}</span>
      <span className={`font-data text-[12px] ${enough ? 'text-[var(--green)]' : 'text-[var(--ink-3)]'}`}>
        {uploading
          ? t.uploading
          : count > 0 ? `${count} images` : t.noImagesYet}
        {!uploading && enough ? ' ✓' : !uploading && count > 0 ? ` (need ${3 - count} more)` : ''}
      </span>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="font-data text-[11px] uppercase tracking-widest px-2 py-1 border-[1px] border-[var(--ink-3)] text-[var(--ink-2)] hover:border-[var(--ink)] hover:bg-[var(--paper-2)] disabled:opacity-50"
      >
        {t.addImages}
      </button>
    </div>
  )
}

function Stage2UploadRow({ materialKey, label, cleanCount, dirtyCount, uploadingClean, uploadingDirty, onFiles, t }) {
  const cleanRef = useRef(null)
  const dirtyRef = useRef(null)

  return (
    <div className="flex flex-col gap-1 p-3 border-[1.5px] border-[var(--ink-4)] bg-[var(--paper)]">
      <span className="font-body text-[13px] text-[var(--ink)] font-semibold truncate">{label}</span>
      <div className="flex gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
            {t.cleanImages}: {cleanCount}
            {uploadingClean ? ` — ${t.uploading}` : ''}
          </span>
          <input ref={cleanRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => { const f = Array.from(e.target.files ?? []); if (f.length) onFiles(materialKey, 'clean', f); e.target.value = '' }}
          />
          <button
            onClick={() => cleanRef.current?.click()}
            disabled={uploadingClean}
            className="font-data text-[11px] uppercase tracking-widest px-2 py-1 border-[1px] border-[var(--green)] text-[var(--green)] hover:bg-[var(--green-soft)] disabled:opacity-50"
          >
            + {t.cleanImages}
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
            {t.dirtyImages}: {dirtyCount}
            {uploadingDirty ? ` — ${t.uploading}` : ''}
          </span>
          <input ref={dirtyRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => { const f = Array.from(e.target.files ?? []); if (f.length) onFiles(materialKey, 'dirty', f); e.target.value = '' }}
          />
          <button
            onClick={() => dirtyRef.current?.click()}
            disabled={uploadingDirty}
            className="font-data text-[11px] uppercase tracking-widest px-2 py-1 border-[1px] border-[var(--orange)] text-[var(--orange)] hover:bg-[var(--paper-2)] disabled:opacity-50"
          >
            + {t.dirtyImages}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const aiConfig = useSelector(s => s.aiConfig)
  const posts    = useSelector(s => s.marketplace.posts)
  const language = useSelector(s => s.user.language)
  const session  = useSelector(s => s.user.session)

  const [tab, setTab]               = useState('shops')
  const [pending, setPending]       = useState(PENDING_SHOPS)
  const [localModel, setLocalModel] = useState(aiConfig.model)
  const [localKey, setLocalKey]     = useState(aiConfig.apiKey)
  const [localPrompt, setLocalPrompt] = useState(aiConfig.systemPrompt)
  const [localThreshold, setLocalThreshold] = useState(aiConfig.confidenceThreshold)
  const [testInput, setTestInput]   = useState('')
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting]       = useState(false)

  // Vertex AI config local state
  const [vProjectId, setVProjectId]         = useState(aiConfig.vertexProjectId ?? '')
  const [vLocation, setVLocation]           = useState(aiConfig.vertexLocation ?? 'us-central1')
  const [vToken, setVToken]                 = useState(aiConfig.vertexAccessToken ?? '')
  const [vS1Endpoint, setVS1Endpoint]       = useState(aiConfig.vertexStage1Endpoint ?? '')
  const [vS2Endpoint, setVS2Endpoint]       = useState(aiConfig.vertexStage2Endpoint ?? '')

  // Stage 1 upload state
  const [classImages, setClassImages]       = useState(() => Object.fromEntries(MATERIAL_KEYS.map(k => [k, 0])))
  const [uploadingClass, setUploadingClass] = useState(() => Object.fromEntries(MATERIAL_KEYS.map(k => [k, false])))

  // Stage 2 upload state
  const [stage2Counts, setStage2Counts] = useState(() =>
    Object.fromEntries(MATERIAL_KEYS.map(k => [k, { clean: 0, dirty: 0 }]))
  )
  const [uploadingStage2, setUploadingStage2] = useState(() =>
    Object.fromEntries(MATERIAL_KEYS.map(k => [k, { clean: false, dirty: false }]))
  )

  // Training state
  const [trainProgress, setTrainProgress] = useState(null)
  const [trainPhase, setTrainPhase]       = useState('idle')
  const [trainedVersion, setTrainedVersion] = useState(null)
  const trainTimer = useRef(null)

  // Reports hook
  const { reports, loading: reportsLoading, approveReport, rejectReport } = useUserReports()
  const pendingCount = reports.length

  // Load initial counts from DB on mount
  useEffect(() => {
    async function loadCounts() {
      try {
        const { data } = await supabase
          .from('training_images')
          .select('material_type, stage, label')
        if (!data) return

        const s1 = {}
        const s2 = {}
        MATERIAL_KEYS.forEach(k => { s1[k] = 0; s2[k] = { clean: 0, dirty: 0 } })

        data.forEach(row => {
          if (row.stage === 1 && s1[row.material_type] !== undefined) {
            s1[row.material_type]++
          }
          if (row.stage === 2 && s2[row.material_type] !== undefined) {
            if (row.label === 'clean') s2[row.material_type].clean++
            if (row.label === 'dirty') s2[row.material_type].dirty++
          }
        })
        setClassImages(s1)
        setStage2Counts(s2)
      } catch {
        // Supabase not configured — counts remain at 0
      }
    }
    loadCounts()
  }, [])

  const handleStage1Files = useCallback(async (materialKey, files) => {
    setUploadingClass(prev => ({ ...prev, [materialKey]: true }))
    let uploaded = 0
    for (const file of files) {
      try {
        const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`
        const path = `stage1/${materialKey}/${uid}.jpg`
        const { error: upErr } = await supabase.storage
          .from('training-images')
          .upload(path, file, { upsert: true })
        if (upErr) continue

        const { data: urlData } = supabase.storage
          .from('training-images')
          .getPublicUrl(path)

        await supabase.from('training_images').insert({
          material_type: materialKey,
          stage:         1,
          label:         materialKey,
          storage_path:  path,
          image_url:     urlData.publicUrl,
          uploaded_by:   session?.user?.id ?? null,
          source:        'admin',
        })
        uploaded++
      } catch {
        // fail silently per file
      }
    }
    setClassImages(prev => ({ ...prev, [materialKey]: prev[materialKey] + uploaded }))
    setUploadingClass(prev => ({ ...prev, [materialKey]: false }))
    if (uploaded > 0) toast.success(`Uploaded ${uploaded} image(s) for ${localName(materialKey, language)}`)
  }, [session, language])

  const handleStage2Files = useCallback(async (materialKey, cleanOrDirty, files) => {
    setUploadingStage2(prev => ({ ...prev, [materialKey]: { ...prev[materialKey], [cleanOrDirty]: true } }))
    let uploaded = 0
    for (const file of files) {
      try {
        const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`
        const path = `stage2/${materialKey}/${cleanOrDirty}/${uid}.jpg`
        const { error: upErr } = await supabase.storage
          .from('training-images')
          .upload(path, file, { upsert: true })
        if (upErr) continue

        const { data: urlData } = supabase.storage
          .from('training-images')
          .getPublicUrl(path)

        await supabase.from('training_images').insert({
          material_type: materialKey,
          stage:         2,
          label:         cleanOrDirty,
          storage_path:  path,
          image_url:     urlData.publicUrl,
          uploaded_by:   session?.user?.id ?? null,
          source:        'admin',
        })
        uploaded++
      } catch {
        // fail silently per file
      }
    }
    setStage2Counts(prev => ({
      ...prev,
      [materialKey]: { ...prev[materialKey], [cleanOrDirty]: prev[materialKey][cleanOrDirty] + uploaded },
    }))
    setUploadingStage2(prev => ({ ...prev, [materialKey]: { ...prev[materialKey], [cleanOrDirty]: false } }))
    if (uploaded > 0) toast.success(`Uploaded ${uploaded} ${cleanOrDirty} image(s) for ${localName(materialKey, language)}`)
  }, [session, language])

  function handleTrain() {
    const classesReady = Object.values(classImages).filter(n => n >= 3).length
    if (classesReady < 2) {
      toast.error('Upload ≥3 images for at least 2 classes first.')
      return
    }
    setTrainPhase('training')
    setTrainProgress(0)
    let p = 0
    trainTimer.current = setInterval(() => {
      p += 4 + Math.floor(Math.random() * 4)
      if (p >= 100) {
        p = 100
        clearInterval(trainTimer.current)
        const ver = `v${Date.now().toString(36).slice(-5)}-studio`
        setTrainedVersion(ver)
        setTrainProgress(100)
        setTrainPhase('ready')
        toast.success('Training complete!')
      } else {
        setTrainProgress(p)
      }
    }, 80)
  }

  function handleDeploy() {
    if (!trainedVersion) return
    dispatch(setAiConfig({
      onnxStage1Url: `local://${trainedVersion}-s1`,
      onnxStage2Url: `local://${trainedVersion}-s2`,
      modelVersion:  trainedVersion,
    }))
    setTrainPhase('deployed')
    toast.success(t.modelDeployed)
  }

  function handleApprove(id) {
    setPending(p => p.filter(s => s.id !== id))
    toast.success('Shop approved')
  }
  function handleRejectShop(id) {
    setPending(p => p.filter(s => s.id !== id))
    toast.error('Shop rejected')
  }

  function handleSaveConfig() {
    dispatch(setAiConfig({
      model:               localModel,
      apiKey:              localKey,
      systemPrompt:        localPrompt,
      confidenceThreshold: localThreshold,
    }))
    toast.success('AI config saved')
  }

  function handleSaveVertexConfig() {
    dispatch(setAiConfig({
      vertexProjectId:      vProjectId,
      vertexLocation:       vLocation,
      vertexAccessToken:    vToken,
      vertexStage1Endpoint: vS1Endpoint,
      vertexStage2Endpoint: vS2Endpoint,
    }))
    toast.success(t.saveVertexConfig)
  }

  async function handleTest() {
    if (!testInput.trim()) return
    setTesting(true)
    setTestResult(null)
    const result = await classifyWaste(testInput, {
      model:               localModel,
      apiKey:              localKey,
      systemPrompt:        localPrompt,
      confidenceThreshold: localThreshold,
    })
    setTestResult(result)
    setTesting(false)
  }

  async function handleExportManifest() {
    try {
      const { data, error } = await supabase.from('training_images').select('*')
      if (error || !data) { toast.error('Could not fetch training images'); return }

      const manifest = {
        stage1: data.filter(r => r.stage === 1).map(r => ({ imageUrl: r.image_url, label: r.label })),
        stage2: data.filter(r => r.stage === 2).map(r => ({ imageUrl: r.image_url, label: r.label, materialType: r.material_type })),
      }
      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = 'dataset-manifest.json'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Manifest exported')
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.admin}</h1>

      {/* Tab bar */}
      <div className="w-full max-w-2xl flex gap-2 flex-wrap">
        <TabBtn active={tab === 'shops'}      onClick={() => setTab('shops')}>{t.shopManagement}</TabBtn>
        <TabBtn active={tab === 'heatmap'}    onClick={() => setTab('heatmap')}>{t.heatmap}</TabBtn>
        <TabBtn active={tab === 'model'}      onClick={() => setTab('model')}>{t.modelConfig}</TabBtn>
        <TabBtn active={tab === 'moderation'} onClick={() => setTab('moderation')}>{t.moderation}</TabBtn>
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
                <div>
                  <p className="font-body text-[15px] text-[var(--ink)] m-0 font-semibold">{s.name}</p>
                  <p className="font-data text-[11px] text-[var(--ink-3)] m-0">{s.owner} · {s.area}</p>
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
            {ACTIVE_SHOPS.map(s => (
              <Card key={s.id} className="flex items-center justify-between">
                <div>
                  <p className="font-body text-[15px] text-[var(--ink)] m-0">{s.name}</p>
                  <p className="font-data text-[11px] text-[var(--ink-3)] m-0">{s.area}</p>
                </div>
                <span className="font-data text-[13px] text-[var(--green)]">{s.scans} scans</span>
              </Card>
            ))}
          </section>
        </div>
      )}

      {/* Heatmap tab */}
      {tab === 'heatmap' && (
        <div className="w-full max-w-2xl flex flex-col gap-4">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">Scan Density by District — Chiang Mai</span>
          <Card className="flex flex-col gap-2 overflow-x-auto">
            <div className="flex gap-1">
              {DISTRICTS.map(d => (
                <span key={d} className="font-data text-[8px] text-[var(--ink-3)] flex-1 text-center truncate">{d}</span>
              ))}
            </div>
            {HEATMAP_DATA.map((row, ri) => (
              <div key={ri} className="flex gap-1">
                {row.map((v, ci) => (
                  <div
                    key={ci}
                    className="flex-1 h-6 border-[1px] border-[var(--ink-4)] flex items-center justify-center"
                    style={{ background: heatColor(v) }}
                    title={`${DISTRICTS[ci]}: ${v}`}
                  >
                    <span className="font-data text-[8px] text-[var(--ink-2)]">{v}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="flex gap-3 pt-1 items-center">
              <span className="font-data text-[10px] text-[var(--ink-3)]">Low</span>
              <div className="w-6 h-3" style={{ background: 'var(--paper-2)', border: '1px solid var(--ink-4)' }} />
              <div className="w-6 h-3" style={{ background: 'var(--green-soft, #C8F5D8)', border: '1px solid var(--ink-4)' }} />
              <div className="w-6 h-3" style={{ background: 'var(--orange)', border: '1px solid var(--ink-4)' }} />
              <span className="font-data text-[10px] text-[var(--ink-3)]">High</span>
            </div>
          </Card>
        </div>
      )}

      {/* AI Model Config tab */}
      {tab === 'model' && (
        <div className="w-full max-w-2xl flex flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.modelConfig}</span>

            <div className="flex flex-col gap-1">
              <label className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.modelVersion}</label>
              <select
                value={localModel}
                onChange={e => setLocalModel(e.target.value)}
                className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-data text-[14px] outline-none focus:border-[var(--green)]"
              >
                {MODEL_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">API Key</label>
              <input
                type="password"
                value={localKey}
                onChange={e => setLocalKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-data text-[14px] outline-none focus:border-[var(--green)]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.promptConfig}</label>
              <textarea
                rows={4}
                value={localPrompt}
                onChange={e => setLocalPrompt(e.target.value)}
                className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[14px] outline-none focus:border-[var(--green)] resize-vertical"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
                Confidence Threshold: {localThreshold}
              </label>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={localThreshold}
                onChange={e => setLocalThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between">
                <span className="font-data text-[10px] text-[var(--ink-3)]">0.5 (lenient)</span>
                <span className="font-data text-[10px] text-[var(--ink-3)]">0.95 (strict)</span>
              </div>
            </div>

            <Button variant="primary" onClick={handleSaveConfig}>{t.saveConfig}</Button>
          </Card>

          {/* Vertex AI Config section */}
          <Card className="flex flex-col gap-4">
            <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.vertexConfig}</span>

            {[
              { label: t.vertexProjectId,  val: vProjectId,    set: setVProjectId,   type: 'text',     ph: 'my-gcp-project' },
              { label: t.vertexLocation,   val: vLocation,     set: setVLocation,    type: 'text',     ph: 'us-central1' },
              { label: t.vertexToken,      val: vToken,        set: setVToken,       type: 'password', ph: 'gcloud auth print-access-token' },
              { label: t.vertexS1Endpoint, val: vS1Endpoint,   set: setVS1Endpoint,  type: 'text',     ph: 'endpoint ID' },
              { label: t.vertexS2Endpoint, val: vS2Endpoint,   set: setVS2Endpoint,  type: 'text',     ph: 'endpoint ID' },
            ].map(({ label, val, set, type, ph }) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{label}</label>
                <input
                  type={type}
                  value={val}
                  onChange={e => set(e.target.value)}
                  placeholder={ph}
                  className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-data text-[14px] outline-none focus:border-[var(--green)]"
                />
              </div>
            ))}

            <Button variant="primary" onClick={handleSaveVertexConfig}>{t.saveVertexConfig}</Button>
          </Card>

          {/* Test panel */}
          <Card className="flex flex-col gap-3">
            <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.secondBrainTitle ?? 'Second Brain'} — Test</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={testInput}
                onChange={e => setTestInput(e.target.value)}
                placeholder="Describe a waste item..."
                className="flex-1 px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[14px] outline-none focus:border-[var(--green)]"
                onKeyDown={e => e.key === 'Enter' && handleTest()}
              />
              <Button variant="primary" onClick={handleTest} disabled={testing}>
                {testing ? '...' : t.analyzeWaste}
              </Button>
            </div>
            {testResult && (
              <div className="flex flex-col gap-1 pt-2 border-t-[1.5px] border-[var(--ink-4)]">
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Material</span>
                  <span className="font-data text-[13px] text-[var(--ink)]">{testResult.materialType}</span>
                  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Grade</span>
                  <span className="font-data text-[13px] text-[var(--ink)]">{testResult.grade}</span>
                  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">{t.confidence}</span>
                  <span className="font-data text-[13px] text-[var(--ink)]">{(testResult.confidence * 100).toFixed(0)}%</span>
                  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Source</span>
                  <span className="font-data text-[13px] text-[var(--ink)]">{testResult.source}</span>
                </div>
                {testResult.explanation && (
                  <p className="font-body text-[13px] text-[var(--ink-3)] m-0 mt-1">{testResult.explanation}</p>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* AI Studio tab */}
      {tab === 'studio' && (
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.studioActiveVer}</span>
              <span className="font-data text-[13px] text-[var(--green)]">{aiConfig.modelVersion ?? 'v0-mock'}</span>
            </div>
            <p className="font-body text-[13px] text-[var(--ink-3)] m-0">{t.studioHint}</p>
          </Card>

          {/* Stage 1 — per-class image upload */}
          <section className="flex flex-col gap-3">
            <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.trainingClasses}</span>
            <div className="grid grid-cols-2 gap-3">
              {MATERIAL_KEYS.map(key => {
                const count  = classImages[key]
                const enough = count >= 3
                return (
                  <ClassUploadCard
                    key={key}
                    materialKey={key}
                    label={localName(key, language)}
                    count={count}
                    enough={enough}
                    uploading={uploadingClass[key]}
                    onFiles={handleStage1Files}
                    t={t}
                  />
                )
              })}
            </div>
          </section>

          {/* Stage 2 — cleanliness dataset */}
          <section className="flex flex-col gap-3">
            <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.stage2Dataset}</span>
            <div className="flex flex-col gap-2">
              {MATERIAL_KEYS.map(key => (
                <Stage2UploadRow
                  key={key}
                  materialKey={key}
                  label={localName(key, language)}
                  cleanCount={stage2Counts[key].clean}
                  dirtyCount={stage2Counts[key].dirty}
                  uploadingClean={uploadingStage2[key].clean}
                  uploadingDirty={uploadingStage2[key].dirty}
                  onFiles={handleStage2Files}
                  t={t}
                />
              ))}
            </div>
          </section>

          {/* Training progress */}
          {trainPhase === 'training' && (
            <Card className="flex flex-col gap-3">
              <span className="font-data text-[12px] text-[var(--green)] uppercase tracking-widest animate-pulse">{t.training}</span>
              <div className="w-full h-3 bg-[var(--paper-2)] border-[1.5px] border-[var(--ink)]">
                <div
                  style={{ width: `${trainProgress}%`, background: 'var(--green)', height: '100%', transition: 'width 0.1s linear' }}
                />
              </div>
              <span className="font-data text-[11px] text-[var(--ink-3)]">{trainProgress}%</span>
            </Card>
          )}

          {(trainPhase === 'idle' || trainPhase === 'ready' || trainPhase === 'deployed') && (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={handleTrain}
                disabled={trainPhase === 'training'}
              >
                {t.trainModel}
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleDeploy}
                disabled={trainPhase !== 'ready'}
                title={trainPhase !== 'ready' ? t.trainFirst : ''}
              >
                {trainPhase === 'deployed' ? `✓ ${t.modelDeployed}` : t.deployModel}
              </Button>
            </div>
          )}

          {trainedVersion && (
            <Card className="flex flex-col gap-1">
              <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{t.modelVersion}</span>
              <span className="font-data text-[14px] text-[var(--ink)]">{trainedVersion}</span>
              <span className="font-data text-[11px] text-[var(--ink-3)]">
                Stage 1: local://{trainedVersion}-s1 · Stage 2: local://{trainedVersion}-s2
              </span>
            </Card>
          )}

          {/* Export manifest */}
          <Button variant="secondary" onClick={handleExportManifest}>{t.exportManifest}</Button>
        </div>
      )}

      {/* Moderation tab */}
      {tab === 'moderation' && (
        <div className="w-full max-w-2xl flex flex-col gap-4">
          <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">
            {t.moderation} ({posts.length} {t.totalPosts})
          </span>

          {posts.length === 0 && (
            <Card className="flex items-center justify-center py-8">
              <p className="font-body text-[15px] text-[var(--ink-3)] m-0">{t.noListings}</p>
            </Card>
          )}

          <div className="flex flex-col gap-3">
            {posts.map(post => (
              <Card
                key={post.id}
                className={`flex flex-col gap-2 ${post.flagged ? 'border-[var(--orange)]' : ''}`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <GradeTag grade={post.grade} />
                    <span className="font-body text-[15px] text-[var(--ink)]">
                      {localName(post.materialType, language)}
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
                    onClick={() => { dispatch(flagPost(post.id)); toast.info(post.flagged ? 'Unflagged' : 'Flagged') }}
                  >
                    {post.flagged ? t.unflagPost : t.flagPost}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { dispatch(removePost(post.id)); toast.error('Post removed') }}
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
                    <span className="font-body text-[14px] text-[var(--ink)]">{localName(report.claimed_material, language)}</span>
                  </div>
                  {report.ai_material && (
                    <div className="flex items-center gap-2">
                      <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">AI said</span>
                      <span className="font-body text-[13px] text-[var(--ink-2)]">{localName(report.ai_material, language)}</span>
                      {report.ai_grade && <GradeTag grade={report.ai_grade} />}
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
                  {t.approveAsLabel} {localName(report.claimed_material, language)}
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
