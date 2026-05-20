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

/* ── Individual listing card ─────────────────────────────────────── */
function ListingCard({ post, language, t }) {
  const navigate = useNavigate()
  const name = language === 'th'
    ? (WASTE_ITEMS[post.materialType]?.nameTh ?? post.materialType)
    : (WASTE_ITEMS[post.materialType]?.nameEn ?? post.materialType)

  return (
    <div className="flex flex-col gap-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] shadow-[2px_2px_0_var(--ink)] overflow-hidden">
      {post.image_url && (
        <img
          src={post.image_url}
          alt={name}
          className="w-full h-36 object-cover border-b-[1.5px] border-[var(--ink)]"
        />
      )}
      <div className="flex flex-col gap-2 p-4 pt-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-body text-[16px] text-[var(--ink)] truncate">{name}</span>
        </div>
        <span className="font-data text-[18px] text-[var(--green-ink)] shrink-0 leading-none">
          ฿{(post.pricePerKg ?? 0).toFixed(0)}/kg
        </span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-data text-[11px] text-[var(--ink-2)]">
            {post.qty ?? 0} kg
          </span>
          <span className="font-data text-[10px] text-[var(--ink-4)]">
            {post.shop || '—'}{post.distanceKm != null ? ` · ${post.distanceKm.toFixed(1)} km` : ''}
          </span>
        </div>
        <button
          onClick={() => navigate('/chat')}
          className="px-4 py-2 min-h-[44px] font-data text-[11px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] bg-transparent cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors shadow-[2px_2px_0_var(--ink)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] whitespace-nowrap"
        >
          {t.contactSeller} →
        </button>
      </div>
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

  const [form, setForm] = useState({
    materialType: MATERIAL_KEYS[0],
    qty:          '',
    pricePerKg:   '',
    contact:      '',
    shop:         '',
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
    if (!form.qty || !form.pricePerKg) { toast.error(t.requiredFields); return }
    setUploading(true)
    let image_url = null
    try {
      if (imageFile) image_url = await uploadImage()
    } finally {
      setUploading(false)
    }
    const payload = {
      ...form,
      qty:        Number(form.qty),
      pricePerKg: Number(form.pricePerKg),
      distanceKm: 0,
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

  const suggested = marketPrice(form.materialType) ?? pricePerKg(form.materialType)

  return (
    <div className="fixed inset-0 bg-[#1A1A1Ae6] flex items-end justify-center z-50 sm:items-center sm:p-4">
      <div className="w-full sm:max-w-md bg-[var(--paper)] border-[1.5px] border-[var(--green)] shadow-[4px_4px_0_var(--ink)] p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-brand text-[20px] text-[var(--ink)]">{t.postAd}</span>
          <button
            onClick={onClose}
            className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest bg-transparent border-none cursor-pointer hover:text-[var(--ink)]"
          >
            {t.cancelLabel}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Material */}
          <div className="flex flex-col gap-1">
            <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.materialTypeLabel}</label>
            <select
              value={form.materialType}
              onChange={e => set('materialType', e.target.value)}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]"
            >
              {MATERIAL_KEYS.map(k => <option key={k} value={k}>{localName(k, language)}</option>)}
            </select>
          </div>

          {/* Weight + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.weightKg}</label>
              <input
                type="number" min="0.1" step="0.1" required
                value={form.qty} onChange={e => set('qty', e.target.value)}
                placeholder="kg"
                className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">
                {t.pricePerKgLabel}
                {suggested != null && (
                  <span className="text-[var(--green)] normal-case ml-1">(~฿{suggested.toFixed(1)})</span>
                )}
              </label>
              <input
                type="number" min="0" step="0.1" required
                value={form.pricePerKg} onChange={e => set('pricePerKg', e.target.value)}
                className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]"
              />
            </div>
          </div>

          {/* Shop name */}
          <div className="flex flex-col gap-1">
            <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.shopName}</label>
            <input
              type="text"
              value={form.shop} onChange={e => set('shop', e.target.value)}
              className="w-full px-3 py-2 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[15px] outline-none focus:border-[var(--green)]"
            />
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-1">
            <label className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest">{t.contactInfo}</label>
            <input
              type="text"
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

          {/* Image upload */}
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

  // Bottom inset: user role has a 68px bottom tab bar, buyer does not
  const bottomInset = role === 'user' ? 'bottom-[76px]' : 'bottom-4'

  return (
    <div className="flex flex-col min-h-full">

      {/* Page header */}
      <div className="px-4 lg:px-8 pt-6">
        <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-[0.15em]">
          Chiang Mai · Today
        </span>
        <h1 className="font-brand text-[28px] text-[var(--ink)] m-0 mt-1 leading-tight">
          {t.marketplaceTitle}
        </h1>

      </div>

      {/* Listing cards */}
      <div className="flex flex-col gap-3 px-4 lg:px-8 py-4 pb-28">
        {loading && (
          <>
            <div className="h-24 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
            <div className="h-24 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
            <div className="h-24 bg-[var(--paper-2)] animate-pulse border-[1.5px] border-[var(--ink-4)]" />
          </>
        )}
        {!loading && posts.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <span className="font-data text-[11px] text-[var(--ink-4)] uppercase tracking-widest">
              {t.noListings}
            </span>
          </div>
        )}
        {!loading && posts.map((post, idx) => (
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
