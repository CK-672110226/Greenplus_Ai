import { useState } from 'react'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { GradeTag } from '../components/GradeTag'
import { classifyWaste } from '../services/secondBrain'
import { setAiConfig } from '../store/aiConfigSlice'
import { removePost, flagPost } from '../store/marketplaceSlice'
import { localName } from '../data/wasteItems'

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

export function AdminPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const aiConfig = useSelector(s => s.aiConfig)
  const posts    = useSelector(s => s.marketplace.posts)
  const language = useSelector(s => s.user.language)

  const [tab, setTab]               = useState('shops')
  const [pending, setPending]       = useState(PENDING_SHOPS)
  const [localModel, setLocalModel] = useState(aiConfig.model)
  const [localKey, setLocalKey]     = useState(aiConfig.apiKey)
  const [localPrompt, setLocalPrompt] = useState(aiConfig.systemPrompt)
  const [localThreshold, setLocalThreshold] = useState(aiConfig.confidenceThreshold)
  const [testInput, setTestInput]   = useState('')
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting]       = useState(false)

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

  return (
    <main className="flex flex-col items-center px-4 py-10 gap-6">
      <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.admin}</h1>

      {/* Tab bar */}
      <div className="w-full max-w-2xl flex gap-2 flex-wrap">
        <TabBtn active={tab === 'shops'}      onClick={() => setTab('shops')}>{t.shopManagement}</TabBtn>
        <TabBtn active={tab === 'heatmap'}    onClick={() => setTab('heatmap')}>{t.heatmap}</TabBtn>
        <TabBtn active={tab === 'model'}      onClick={() => setTab('model')}>{t.modelConfig}</TabBtn>
        <TabBtn active={tab === 'moderation'} onClick={() => setTab('moderation')}>{t.moderation}</TabBtn>
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

      {/* Moderation tab (C-14) */}
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
    </main>
  )
}
