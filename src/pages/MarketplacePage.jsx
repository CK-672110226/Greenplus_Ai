import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useT } from '../hooks/useT'
import { Button } from '../components/Button'
import { useSelector, useDispatch } from 'react-redux'
import { localName, WASTE_ITEMS, pricePerKg } from '../data/wasteItems'
import { addPost, setPosts } from '../store/marketplaceSlice'
import { useSupabaseMarketplace } from '../hooks/useSupabaseMarketplace'
import { useMarketPricing } from '../hooks/useMarketPricing'

const MATERIAL_KEYS = Object.keys(WASTE_ITEMS)

const POST_TYPES = ['sell', 'request', 'event']

const TYPE_BADGE_COLORS = {
  sell:    'border-[var(--green-ink)] text-[var(--green-ink)] bg-[var(--green-soft)]',
  request: 'border-[var(--orange)] text-[var(--orange)] bg-[var(--paper-2)]',
  event:   'border-[var(--ink-2)] text-[var(--ink-2)] bg-[var(--paper-2)]',
}

function isOpenNow(opensAt, closesAt) {
  if (!opensAt || !closesAt) return null
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  const nowStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  return nowStr >= opensAt && nowStr < closesAt
}

/* ── Post type badge label ───────────────────────────────────────── */
function typeBadgeLabel(postType, t) {
  if (postType === 'request') return t.requestTypeBadge
  if (postType === 'event')   return t.eventTypeBadge
  return t.sellTypeBadge
}

/* ── Material chips (display) ────────────────────────────────────── */
function MaterialChips({ keys, language }) {
  if (!keys || keys.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {keys.map(k => (
        <span
          key={k}
          className="font-data text-[9px] uppercase tracking-wider border-[1px] border-[var(--ink-4)] text-[var(--ink-3)] px-1.5 py-0.5"
        >
          {localName(k, language)}
        </span>
      ))}
    </div>
  )
}

/* ── Individual listing card ─────────────────────────────────────── */
function ListingCard({ post, language, t }) {
  const navigate  = useNavigate()
  const openStatus = isOpenNow(post.opensAt, post.closesAt)
  const badgeClass = TYPE_BADGE_COLORS[post.postType] ?? TYPE_BADGE_COLORS.sell

  return (
    <div className="flex flex-col gap-0 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] shadow-[2px_2px_0_var(--ink)] overflow-hidden">
      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title ?? ''}
          className="w-full h-36 object-cover border-b-[1.5px] border-[var(--ink)]"
        />
      )}
      <div className="flex flex-col gap-2 p-4 pt-3">
        {/* Type badge + open status */}
        <div className="flex items-center gap-2">
          <span className={`font-data text-[9px] uppercase tracking-widest px-1.5 py-0.5 border-[1px] shrink-0 ${badgeClass}`}>
            {typeBadgeLabel(post.postType, t)}
          </span>
          {openStatus !== null && (
            <span className={[
              'font-data text-[9px] uppercase tracking-widest px-1.5 py-0.5 border-[1px] shrink-0',
              openStatus
                ? 'border-[var(--green-ink)] text-[var(--green-ink)] bg-[var(--green-soft)]'
                : 'border-[var(--ink-3)] text-[var(--ink-3)] bg-[var(--paper-2)]',
            ].join(' ')}>
              {openStatus ? t.openNow : t.closed}
            </span>
          )}
        </div>

        {/* Title */}
        {post.title && (
          <span className="font-body text-[16px] text-[var(--ink)] leading-snug">
            {post.title}
          </span>
        )}

        {/* Description */}
        {post.description && (
          <p className="font-body text-[13px] text-[var(--ink-2)] leading-relaxed line-clamp-3 m-0">
            {post.description}
          </p>
        )}

        {/* Material chips */}
        <MaterialChips keys={post.materialTypes} language={language} />

        {/* Price row (sell only) + weight */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-data text-[11px] text-[var(--ink-3)]">
            {post.shop || '—'}{post.distanceKm != null ? ` · ${post.distanceKm.toFixed(1)} km` : ''}
          </span>
          <div className="flex items-baseline gap-2 shrink-0">
            {post.qty != null && (
              <span className="font-data text-[11px] text-[var(--ink-2)]">{post.qty} kg</span>
            )}
            {post.postType === 'sell' && post.pricePerKg != null && (
              <span className="font-data text-[16px] text-[var(--green-ink)] leading-none">
                ฿{Number(post.pricePerKg).toFixed(0)}/kg
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/chat')}
          className="w-full py-2 min-h-[44px] font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] bg-transparent cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors shadow-[2px_2px_0_var(--ink)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          {t.contactSeller} →
        </button>
      </div>
    </div>
  )
}

/* ── Material multi-select chips (form) ──────────────────────────── */
function MaterialPicker({ selected, onChange, language, t }) {
  function toggle(key) {
    onChange(
      selected.includes(key)
        ? selected.filter(k => k !== key)
        : [...selected, key]
    )
  }
  return (
    <div className="flex flex-col gap-1">
      <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">
        {t.materialsLabel}
      </label>
      <div className="flex flex-wrap gap-2">
        {MATERIAL_KEYS.map(k => {
          const active = selected.includes(k)
          return (
            <button
              key={k}
              type="button"
              onClick={() => toggle(k)}
              className={[
                'px-3 py-1.5 font-data text-[11px] uppercase tracking-wider border-[1.5px] cursor-pointer transition-colors',
                active
                  ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]'
                  : 'bg-[var(--paper)] text-[var(--ink-2)] border-[var(--ink-4)] hover:border-[var(--ink)]',
              ].join(' ')}
            >
              {localName(k, language)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Post Ad form (modal overlay) ────────────────────────────────── */
function PostAdForm({ onClose, onAdd, marketPrice }) {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)
  const session  = useSelector(s => s.user.session)
  const imgRef   = useRef(null)

  const [postType, setPostType]   = useState('sell')
  const [form, setForm] = useState({
    title:        '',
    description:  '',
    materialTypes:[],
    qty:          '',
    pricePerKg:   '',
    contact:      '',
    lat:          null,
    lng:          null,
  })
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading,    setUploading]    = useState(false)

  function set(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  function handleImageSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage() {
    if (!imageFile || !session?.user?.id) return null
    const { supabase: sb } = await import('../lib/supabase')
    const ext  = imageFile.name.split('.').pop().toLowerCase()
    const path = `${session.user.id}/${Date.now()}.${ext}`
    const { error } = await sb.storage
      .from('marketplace-images')
      .upload(path, imageFile, { contentType: imageFile.type, upsert: false })
    if (error) return null
    const { data: { publicUrl } } = sb.storage.from('marketplace-images').getPublicUrl(path)
    return publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { toast.error(t.requiredFields); return }
    if (postType === 'sell' && !form.pricePerKg) { toast.error(t.requiredFields); return }
    setUploading(true)
    let image_url = null
    try {
      if (imageFile) image_url = await uploadImage()
    } finally {
      setUploading(false)
    }
    const payload = {
      postType,
      title:        form.title.trim(),
      description:  form.description.trim() || null,
      materialTypes: form.materialTypes,
      qty:          form.qty ? Number(form.qty) : null,
      pricePerKg:   postType === 'sell' && form.pricePerKg ? Number(form.pricePerKg) : null,
      contact:      form.contact || null,
      lat:          form.lat,
      lng:          form.lng,
      distanceKm:   0,
      image_url,
    }
    if (onAdd) {
      const res = await onAdd(payload)
      if (res && !res.ok) { toast.error(res.error ?? t.errorGeneric); return }
    } else {
      dispatch(addPost(payload))
    }
    toast.success(t.postSuccess)
    onClose()
  }

  const postTypeLabels = {
    sell:    t.postTypeSell,
    request: t.postTypeRequest,
    event:   t.postTypeEvent,
  }

  const suggested = postType === 'sell' && form.materialTypes.length === 1
    ? (marketPrice(form.materialTypes[0]) ?? pricePerKg(form.materialTypes[0]))
    : null

  return (
    <div className="fixed inset-0 bg-[#1A1A1Ae6] flex items-end justify-center z-50 sm:items-center sm:p-4">
      <div className="w-full sm:max-w-md bg-[var(--paper)] border-[1.5px] border-[var(--green)] shadow-[4px_4px_0_var(--ink)] p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-brand text-[20px] text-[var(--ink)]">{t.postAd}</span>
          <button
            onClick={onClose}
            className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest bg-transparent border-none cursor-pointer hover:text-[var(--ink)]"
          >
            {t.cancelLabel}
          </button>
        </div>

        {/* Post type tabs */}
        <div className="grid grid-cols-3 gap-1">
          {POST_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setPostType(type)}
              className={[
                'py-2 font-data text-[10px] uppercase tracking-wider border-[1.5px] cursor-pointer transition-colors',
                postType === type
                  ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]'
                  : 'bg-[var(--paper)] text-[var(--ink-3)] border-[var(--ink-4)] hover:border-[var(--ink)]',
              ].join(' ')}
            >
              {postTypeLabels[type]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">
              {t.postTitleLabel} <span className="text-[var(--orange)]">*</span>
            </label>
            <input
              type="text"
              maxLength={120}
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder={t.postTitlePlaceholder}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.postDescLabel}</label>
            <textarea
              maxLength={500}
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder={t.postDescPlaceholder}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[14px] outline-none focus:border-[var(--green)] resize-none"
            />
          </div>

          {/* Materials (sell / request only) */}
          {postType !== 'event' && (
            <MaterialPicker
              selected={form.materialTypes}
              onChange={v => set('materialTypes', v)}
              language={language}
              t={t}
            />
          )}

          {/* Weight (optional for request/event) + Price (required for sell only) */}
          {postType !== 'event' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">
                  {postType === 'sell' ? t.weightKg : t.weightOptional}
                </label>
                <input
                  type="number" min="0.1" max="10000" step="0.1"
                  value={form.qty} onChange={e => set('qty', e.target.value)}
                  placeholder="kg"
                  className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">
                  {postType === 'sell' ? t.pricePerKgLabel : t.priceOptional}
                  {postType === 'sell' && (
                    <span className="text-[var(--orange)] ml-1">*</span>
                  )}
                  {suggested != null && (
                    <span className="text-[var(--green)] normal-case ml-1">(~฿{suggested.toFixed(1)})</span>
                  )}
                </label>
                <input
                  type="number" min="0" max="9999" step="0.1"
                  required={postType === 'sell'}
                  value={form.pricePerKg} onChange={e => set('pricePerKg', e.target.value)}
                  placeholder="฿"
                  className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]"
                />
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="flex flex-col gap-1">
            <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.contactInfo}</label>
            <input
              type="text"
              maxLength={50}
              value={form.contact} onChange={e => set('contact', e.target.value)}
              placeholder="LINE / Tel"
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1">
            <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.locationLabel}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.lat != null ? `${form.lat.toFixed(5)}, ${form.lng?.toFixed(5)}` : ''}
                readOnly
                placeholder={t.tapToLocate}
                className="flex-1 px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper-2)] font-data text-[11px] outline-none text-[var(--ink-3)]"
              />
              <button
                type="button"
                onClick={() => {
                  if (!navigator.geolocation) return
                  navigator.geolocation.getCurrentPosition(
                    pos => { set('lat', pos.coords.latitude); set('lng', pos.coords.longitude) },
                    () => {}
                  )
                }}
                className="px-3 py-2 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] bg-transparent hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors whitespace-nowrap cursor-pointer"
              >
                {t.useMyLocation}
              </button>
            </div>
          </div>

          {/* Photo */}
          <div className="flex flex-col gap-1">
            <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.mpImageLabel}</label>
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="w-full h-32 object-cover border-[1.5px] border-[var(--ink)] mb-1" />
            )}
            <button
              type="button"
              onClick={() => imgRef.current?.click()}
              className="px-3 py-2 font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink-4)] bg-transparent hover:border-[var(--ink)] transition-colors cursor-pointer text-left text-[var(--ink-3)] hover:text-[var(--ink)]"
            >
              {imageFile ? imageFile.name : t.mpImageHelp}
            </button>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={uploading}>
            {uploading ? t.uploadingPhoto : t.postAd}
          </Button>
        </form>
      </div>
    </div>
  )
}

/* ── Filter tabs ─────────────────────────────────────────────────── */
function FilterTabs({ active, onChange, t }) {
  const tabs = [
    { key: 'all',     label: t.filterAll },
    { key: 'sell',    label: t.filterSell },
    { key: 'request', label: t.filterRequest },
    { key: 'event',   label: t.filterEvent },
  ]
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={[
            'px-3 py-1.5 font-data text-[10px] uppercase tracking-wider border-[1.5px] cursor-pointer transition-colors whitespace-nowrap shrink-0',
            active === tab.key
              ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]'
              : 'bg-[var(--paper)] text-[var(--ink-3)] border-[var(--ink-4)] hover:border-[var(--ink)]',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

/* ── MarketplacePage ─────────────────────────────────────────────── */
export function MarketplacePage() {
  const t        = useT()
  const dispatch = useDispatch()
  const language = useSelector(s => s.user.language)
  const role     = useSelector(s => s.user.profile?.role)

  const { posts, loading, addPost: supabaseAddPost } = useSupabaseMarketplace()
  const { marketPrice } = useMarketPricing()

  useEffect(() => {
    if (posts.length > 0) dispatch(setPosts(posts))
  }, [posts, dispatch])

  const [isPosting, setIsPosting] = useState(false)
  const [filter,    setFilter]    = useState('all')

  const filtered = filter === 'all' ? posts : posts.filter(p => p.postType === filter)

  const bottomInset = role === 'user' ? 'bottom-[76px]' : 'bottom-4'

  return (
    <div className="flex flex-col min-h-full">

      {/* Page header */}
      <div className="px-4 lg:px-8 pt-6 pb-2">
        <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-[0.15em]">
          Chiang Mai · Today
        </span>
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0 mt-1 leading-tight">
          {t.marketplaceTitle}
        </h1>
      </div>

      {/* Filter tabs */}
      <div className="px-4 lg:px-8 py-2">
        <FilterTabs active={filter} onChange={setFilter} t={t} />
      </div>

      {/* Listing cards */}
      <div className="flex flex-col gap-3 px-4 lg:px-8 py-4 pb-28">
        {loading && (
          <>
            <div className="h-28 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
            <div className="h-28 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
            <div className="h-28 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
          </>
        )}
        {!loading && filtered.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <span className="font-data text-[11px] text-[var(--ink-4)] uppercase tracking-widest">
              {t.noListings}
            </span>
          </div>
        )}
        {!loading && filtered.map((post, idx) => (
          <ListingCard
            key={post.id ?? idx}
            post={post}
            language={language}
            t={t}
          />
        ))}
      </div>

      {/* Sticky Post Ad button */}
      <div className={`fixed ${bottomInset} left-0 right-0 flex justify-center px-4 pointer-events-none z-30`}>
        <button
          onClick={() => setIsPosting(true)}
          className="pointer-events-auto w-full max-w-lg py-3 font-data text-[12px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] bg-[var(--paper)] cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors shadow-[3px_3px_0_var(--ink)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
        >
          + {t.postAd}
        </button>
      </div>

      {/* Post Ad modal */}
      {isPosting && (
        <PostAdForm
          onClose={() => setIsPosting(false)}
          onAdd={supabaseAddPost}
          marketPrice={marketPrice}
        />
      )}
    </div>
  )
}
