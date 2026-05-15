import { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { removePost, flagPost } from '../store/marketplaceSlice'
import { setLabel as setCustomLabel, removeLabel as removeCustomLabel } from '../store/customLabelsSlice'
import { useResolvedName } from '../hooks/useResolvedName'
import { supabase } from '../lib/supabase'
import { useUserReports } from '../hooks/useUserReports'
import { useShops } from '../hooks/useShops'
import { setAiConfig } from '../store/aiConfigSlice'
import { useModelRegistry } from '../hooks/useModelRegistry'


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


function FolderCard({ materialKey, label, count, enough, uploading, onFiles, onRemove }) {
  const fileRef = useRef(null)

  function handleFiles(e) {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) onFiles(materialKey, files)
    e.target.value = ''
  }

  return (
    <div
      className={[
        'relative flex flex-col items-center gap-2 p-4 border-[1.5px] bg-[var(--paper)] cursor-default',
        enough ? 'border-[var(--green)]' : 'border-[var(--ink-4)]',
      ].join(' ')}
    >
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center font-data text-[11px] text-[var(--ink-4)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer leading-none"
        title="Remove class"
      >
        ×
      </button>

      {/* Folder icon */}
      <svg width="32" height="28" viewBox="0 0 24 22" fill="none" stroke={enough ? 'var(--green)' : 'var(--ink-3)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6a2 2 0 012-2h4l2 2h9a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      </svg>

      {/* Label */}
      <span className="font-data text-[11px] text-[var(--ink)] uppercase tracking-widest text-center leading-tight line-clamp-2 w-full">
        {label}
      </span>

      {/* Count badge */}
      <span className={`font-data text-[11px] ${enough ? 'text-[var(--green)]' : 'text-[var(--ink-3)]'}`}>
        {uploading ? '…' : `${count} img${count !== 1 ? 's' : ''}`}
        {!uploading && enough ? ' ✓' : ''}
      </span>

      {/* Upload trigger */}
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="mt-1 w-full font-data text-[10px] uppercase tracking-widest py-1 border-[1px] border-[var(--ink-4)] text-[var(--ink-3)] hover:border-[var(--ink)] hover:bg-[var(--paper-2)] disabled:opacity-50 bg-transparent cursor-pointer"
      >
        + Add
      </button>
    </div>
  )
}

async function translateText(text, from, to) {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    )
    const json = await res.json()
    return json.responseStatus === 200 ? json.responseData.translatedText : null
  } catch {
    return null
  }
}

function NewFolderDialog({ open, onClose, onConfirm, usedLabels }) {
  const [nameTh, setNameTh] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [translating, setTranslating] = useState(null) // 'th' | 'en' | null
  const thRef      = useRef(null)
  const timerRef   = useRef(null)
  const lastThRef  = useRef('')
  const lastEnRef  = useRef('')

  const trimTh    = nameTh.trim()
  const trimEn    = nameEn.trim()
  const key       = trimTh || trimEn
  const duplicate = usedLabels.map(l => l.toLowerCase()).includes(key.toLowerCase())
  const canCreate = key.length > 0 && !duplicate

  function scheduleTranslate(text, from, to, setter) {
    clearTimeout(timerRef.current)
    if (!text.trim()) return
    timerRef.current = setTimeout(async () => {
      setTranslating(to)
      const result = await translateText(text.trim(), from, to)
      setTranslating(null)
      if (result) setter(result)
    }, 600)
  }

  function handleChangeTh(val) {
    setNameTh(val)
    if (val.trim() !== lastThRef.current) {
      lastThRef.current = val.trim()
      scheduleTranslate(val, 'th', 'en', setNameEn)
    }
  }

  function handleChangeEn(val) {
    setNameEn(val)
    if (val.trim() !== lastEnRef.current) {
      lastEnRef.current = val.trim()
      scheduleTranslate(val, 'en', 'th', setNameTh)
    }
  }

  function handleConfirm() {
    if (!canCreate) return
    clearTimeout(timerRef.current)
    onConfirm({ key, nameTh: trimTh, nameEn: trimEn })
    setNameTh(''); setNameEn('')
    lastThRef.current = ''; lastEnRef.current = ''
  }
  function handleClose() {
    clearTimeout(timerRef.current)
    setNameTh(''); setNameEn('')
    lastThRef.current = ''; lastEnRef.current = ''
    onClose()
  }
  function handleKeyDown(e) {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') handleClose()
  }

  useEffect(() => {
    if (open) setTimeout(() => thRef.current?.focus(), 50)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1Acc] px-4" onClick={handleClose}>
      <div
        className="w-full max-w-xs bg-[var(--paper)] border-[2px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] flex flex-col gap-4 p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <span className="font-brand text-[20px] text-[var(--ink)] leading-tight">New Class</span>
          <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">
            พิมพ์ภาษาใดก็แปลให้อัตโนมัติ
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">ชื่อภาษาไทย</span>
              {translating === 'th' && (
                <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-widest animate-pulse">แปล…</span>
              )}
            </div>
            <input
              ref={thRef}
              type="text"
              value={nameTh}
              onChange={e => handleChangeTh(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="เช่น ขวดพลาสติก"
              maxLength={60}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] text-[var(--ink)] outline-none focus:border-[var(--green)] placeholder:text-[var(--ink-4)]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">English name</span>
              {translating === 'en' && (
                <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-widest animate-pulse">translating…</span>
              )}
            </div>
            <input
              type="text"
              value={nameEn}
              onChange={e => handleChangeEn(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Plastic Bottle"
              maxLength={60}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] text-[var(--ink)] outline-none focus:border-[var(--green)] placeholder:text-[var(--ink-4)]"
            />
          </div>
          {duplicate && (
            <span className="font-data text-[10px] text-[var(--orange)] uppercase tracking-widest">
              Class already exists
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={!canCreate}
            className="flex-1 py-2 bg-[var(--ink)] text-[var(--paper)] font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-[var(--ink-2)] transition-colors"
          >
            Create
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-2 bg-transparent text-[var(--ink)] font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink-4)] hover:border-[var(--ink)] cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
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

// ── Model Registry UI ────────────────────────────────────────────

function ModelRegistrySection({ folders }) {
  const { files, activeByKey, loading, uploadModel, registerModelUrl, activateModel } = useModelRegistry()
  const dispatch = useDispatch()

  // Upload form state
  const [stage,        setStage]        = useState(1)
  const [materialKey,  setMaterialKey]  = useState('')
  const [versionTag,   setVersionTag]   = useState('')
  const [modelFile,    setModelFile]    = useState(null)
  const [metaFile,     setMetaFile]     = useState(null)
  const [tmUrl,        setTmUrl]        = useState('')
  const [uploadMode,   setUploadMode]   = useState('url') // 'url' | 'file'
  const [busy,         setBusy]         = useState(false)
  const modelFileRef   = useRef(null)
  const metaFileRef    = useRef(null)

  async function handleRegister() {
    setBusy(true)
    try {
      if (uploadMode === 'url') {
        if (!tmUrl.trim()) { toast.error('Paste a model URL first'); return }
        await registerModelUrl({
          stage,
          materialType: stage === 2 ? materialKey : null,
          versionTag,
          modelUrl:    tmUrl.trim(),
          classLabels: null,
        })
        toast.success('Model registered')
        setTmUrl(''); setVersionTag('')
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
      // Immediately update Redux so ScanPage picks up without reload
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

  const stage1Files  = files.filter(f => f.stage === 1)
  const stage2Files  = files.filter(f => f.stage === 2)

  return (
    <section className="flex flex-col gap-4 pt-2">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--ink-4)]" />
        <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest whitespace-nowrap">Model Registry</span>
        <div className="flex-1 h-px bg-[var(--ink-4)]" />
      </div>

      {/* Upload / Register form */}
      <Card className="flex flex-col gap-4">
        <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">Add Model</span>

        {/* Stage selector */}
        <div className="flex gap-2">
          <button onClick={() => setStage(1)}
            className={['flex-1 py-1.5 font-data text-[11px] uppercase tracking-widest border-[1.5px]',
              stage === 1 ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]' : 'bg-transparent text-[var(--ink)] border-[var(--ink-4)] hover:border-[var(--ink)]'].join(' ')}>
            Stage 1 — Classifier
          </button>
          <button onClick={() => setStage(2)}
            className={['flex-1 py-1.5 font-data text-[11px] uppercase tracking-widest border-[1.5px]',
              stage === 2 ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]' : 'bg-transparent text-[var(--ink)] border-[var(--ink-4)] hover:border-[var(--ink)]'].join(' ')}>
            Stage 2 — Cleanliness
          </button>
        </div>

        {/* Material select for stage 2 */}
        {stage === 2 && (
          <select
            value={materialKey}
            onChange={e => setMaterialKey(e.target.value)}
            className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[14px] text-[var(--ink)] outline-none"
          >
            <option value="">Select material class…</option>
            {folders.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        )}

        {/* Version tag */}
        <input
          type="text"
          placeholder="Version tag (e.g. v1.0-jun26)"
          value={versionTag}
          onChange={e => setVersionTag(e.target.value)}
          className="w-full px-3 py-2 border-[1.5px] border-[var(--ink-4)] bg-[var(--paper)] font-data text-[12px] text-[var(--ink)] outline-none focus:border-[var(--ink)] placeholder:text-[var(--ink-4)]"
        />

        {/* Mode toggle */}
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
            <input
              type="text"
              placeholder="https://teachablemachine.withgoogle.com/models/XXXX/model.json"
              value={tmUrl}
              onChange={e => setTmUrl(e.target.value)}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink-4)] bg-[var(--paper)] font-data text-[11px] text-[var(--ink)] outline-none focus:border-[var(--green)] placeholder:text-[var(--ink-4)]"
            />
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
            <span className="font-data text-[10px] text-[var(--ink-4)]">
              Upload weights.bin to the same Supabase storage folder manually (TM export zip)
            </span>
          </div>
        )}

        <Button variant="primary" onClick={handleRegister} disabled={busy || (stage === 2 && !materialKey)}>
          {busy ? 'Saving…' : 'Register Model'}
        </Button>
      </Card>

      {/* Uploaded models list */}
      {loading ? (
        <div className="h-12 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
      ) : (
        <div className="flex flex-col gap-3">
          {/* Stage 1 */}
          <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest">Stage 1 — Material Classifiers</span>
          {stage1Files.length === 0 && (
            <p className="font-data text-[11px] text-[var(--ink-4)] m-0">No models yet</p>
          )}
          {stage1Files.map(f => (
            <Card key={f.id} className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-data text-[12px] text-[var(--ink)] truncate">{f.version_tag ?? f.id.slice(0, 8)}</span>
                <span className="font-data text-[10px] text-[var(--ink-4)] truncate">{f.model_url}</span>
                {f.class_labels && (
                  <span className="font-data text-[10px] text-[var(--ink-3)]">{(f.class_labels ?? []).join(' · ')}</span>
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

          {/* Stage 2 */}
          <span className="font-data text-[10px] text-[var(--ink-4)] uppercase tracking-widest mt-2">Stage 2 — Cleanliness Models (per material)</span>
          {stage2Files.length === 0 && (
            <p className="font-data text-[11px] text-[var(--ink-4)] m-0">No models yet</p>
          )}
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

export function AdminPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const aiConfig = useSelector(s => s.aiConfig)
  const posts    = useSelector(s => s.marketplace.posts)
  const session  = useSelector(s => s.user.session)
  const resolve  = useResolvedName()

  const { shops: allShops } = useShops()

  const [tab, setTab]               = useState('shops')
  const [pending, setPending]       = useState([])
  // Folder-based class management
  const [folders, setFolders]             = useState([]) // materialKeys the admin has created
  const [showNewFolder, setShowNewFolder] = useState(false)
  // Stage 1 upload state (keyed by materialKey, populated from DB on mount)
  const [classImages, setClassImages]       = useState({})
  const [uploadingClass, setUploadingClass] = useState({})

  // Stage 2 upload state
  const [stage2Counts, setStage2Counts]     = useState({})
  const [uploadingStage2, setUploadingStage2] = useState({})

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
        const seen = new Set()

        data.forEach(row => {
          const mt = row.material_type
          if (!mt) return
          if (!(mt in s1)) { s1[mt] = 0; s2[mt] = { clean: 0, dirty: 0 } }
          if (row.stage === 1) {
            s1[mt]++
            seen.add(mt)
          }
          if (row.stage === 2) {
            if (row.label === 'clean') s2[mt].clean++
            if (row.label === 'dirty') s2[mt].dirty++
            seen.add(mt)
          }
        })
        setClassImages(s1)
        setStage2Counts(s2)
        if (seen.size > 0) setFolders([...seen])
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
    if (uploaded > 0) toast.success(`Uploaded ${uploaded} image(s) for ${resolve(materialKey)}`)
  }, [session, resolve])

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
    if (uploaded > 0) toast.success(`Uploaded ${uploaded} ${cleanOrDirty} image(s) for ${resolve(materialKey)}`)
  }, [session, resolve])

  function handleTrain() {
    const classesReady = folders.filter(k => classImages[k] >= 3).length
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

  function handleAddFolder({ key, nameTh, nameEn }) {
    dispatch(setCustomLabel({ key, th: nameTh, en: nameEn }))
    setFolders(f => [...f, key])
    setClassImages(prev => key in prev ? prev : { ...prev, [key]: 0 })
    setUploadingClass(prev => key in prev ? prev : { ...prev, [key]: false })
    setStage2Counts(prev => key in prev ? prev : { ...prev, [key]: { clean: 0, dirty: 0 } })
    setUploadingStage2(prev => key in prev ? prev : { ...prev, [key]: { clean: false, dirty: false } })
    setShowNewFolder(false)
  }
  function handleRemoveFolder(key) {
    dispatch(removeCustomLabel(key))
    setFolders(f => f.filter(k => k !== key))
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
            {allShops.length === 0 && (
              <p className="font-body text-[14px] text-[var(--ink-3)] m-0">—</p>
            )}
            {allShops.map(s => (
              <Card key={s.id} className="flex items-center justify-between">
                <div>
                  <p className="font-body text-[15px] text-[var(--ink)] m-0">{s.name}</p>
                </div>
              </Card>
            ))}
          </section>
        </div>
      )}

      {/* Heatmap tab */}
      {tab === 'heatmap' && (
        <div className="w-full max-w-2xl flex flex-col gap-4">
          <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">Scan Density by District — Chiang Mai</span>
          <Card className="flex flex-col items-center gap-3 py-12">
            <span className="font-data text-[13px] text-[var(--ink-3)] uppercase tracking-widest">No scan data yet</span>
            <span className="font-data text-[11px] text-[var(--ink-4)]">
              Heatmap requires aggregate scan_history data (milestone A-05)
            </span>
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

          {/* Stage 1 — folder-based class upload */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.trainingClasses}</span>
              <span className="font-data text-[11px] text-[var(--ink-4)]">
                {folders.filter(k => classImages[k] >= 3).length}/{folders.length} ready
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {folders.map(key => (
                <FolderCard
                  key={key}
                  materialKey={key}
                  label={resolve(key)}
                  count={classImages[key] ?? 0}
                  enough={(classImages[key] ?? 0) >= 3}
                  uploading={uploadingClass[key] ?? false}
                  onFiles={handleStage1Files}
                  onRemove={() => handleRemoveFolder(key)}
                />
              ))}
              <button
                onClick={() => setShowNewFolder(true)}
                className="flex flex-col items-center justify-center gap-2 p-4 border-[1.5px] border-dashed border-[var(--ink-4)] hover:border-[var(--ink)] bg-transparent cursor-pointer transition-colors min-h-[120px]"
              >
                <span className="font-brand text-[28px] text-[var(--ink-3)] leading-none">+</span>
                <span className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-4)]">New class</span>
              </button>
            </div>
            {folders.length === 0 && (
              <p className="font-data text-[11px] text-[var(--ink-4)] uppercase tracking-widest m-0">
                Press + to add a material class
              </p>
            )}
          </section>

          {/* Stage 2 — cleanliness dataset */}
          <section className="flex flex-col gap-3">
            <span className="font-data text-[12px] text-[var(--ink-2)] uppercase tracking-widest">{t.stage2Dataset}</span>
            <div className="flex flex-col gap-2">
              {folders.length === 0 && (
                <p className="font-data text-[11px] text-[var(--ink-4)] uppercase tracking-widest m-0">
                  Add classes in Stage 1 first
                </p>
              )}
              {folders.map(key => (
                <Stage2UploadRow
                  key={key}
                  materialKey={key}
                  label={resolve(key)}
                  cleanCount={stage2Counts[key]?.clean ?? 0}
                  dirtyCount={stage2Counts[key]?.dirty ?? 0}
                  uploadingClean={uploadingStage2[key]?.clean ?? false}
                  uploadingDirty={uploadingStage2[key]?.dirty ?? false}
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

          {/* Model Registry */}
          <ModelRegistrySection folders={folders} />
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

      <NewFolderDialog
        open={showNewFolder}
        onClose={() => setShowNewFolder(false)}
        onConfirm={handleAddFolder}
        usedLabels={folders}
      />

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
