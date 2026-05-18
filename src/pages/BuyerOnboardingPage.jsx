import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { useOnboardingActions } from '../hooks/useOnboardingActions'
import { WASTE_ITEMS, localName } from '../data/wasteItems'
import { LocationPicker } from '../components/LocationPicker'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function OnbStepper({ step }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {[1, 2, 3].map((s, i) => {
        const done   = s < step
        const active = s === step
        return (
          <div key={s} className="flex items-center">
            <div
              className={[
                'w-7 h-7 flex items-center justify-center border-[1.5px] font-data text-[12px]',
                done   ? 'bg-[var(--ink)] border-[var(--ink)] text-[var(--paper)]'  : '',
                active ? 'bg-[var(--green)] border-[var(--ink)] text-[var(--ink)]'  : '',
                !done && !active ? 'bg-[var(--paper-2)] border-[var(--ink-4)] text-[var(--ink-3)]' : '',
              ].join(' ')}
            >
              {done ? '✓' : s}
            </div>
            {i < 2 && (
              <div className={[
                'h-[1.5px] w-10',
                s < step ? 'bg-[var(--ink)]' : 'bg-[var(--ink-4)]',
              ].join(' ')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const INPUT_CLS = 'w-full border-[1.5px] border-[var(--ink)] px-3 py-2 bg-[var(--paper)] font-body text-[15px] outline-none focus:shadow-[2px_2px_0_var(--ink)]'
const BTN_PRIMARY = 'px-6 py-2 bg-[var(--ink)] text-[var(--paper)] font-data text-[13px] uppercase tracking-wider cursor-pointer border-none'
const BTN_SECONDARY = 'px-6 py-2 bg-[var(--paper)] text-[var(--ink)] font-data text-[13px] uppercase tracking-wider cursor-pointer border-[1.5px] border-[var(--ink)]'

export function BuyerOnboardingPage() {
  const navigate           = useNavigate()
  const session            = useSelector(s => s.user.session)
  const onboardingActions  = useOnboardingActions()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    shopName:          '',
    description:       '',
    phone:             '',
    lineId:            '',
    selectedMaterials: [],
    openDays:          [],
    pickupRadius:      5,
    lat:               18.7883,
    lng:               98.9853,
  })

  function set(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  function toggleMaterial(key) {
    set('selectedMaterials', formData.selectedMaterials.includes(key)
      ? formData.selectedMaterials.filter(m => m !== key)
      : [...formData.selectedMaterials, key]
    )
  }

  function toggleDay(day) {
    set('openDays', formData.openDays.includes(day)
      ? formData.openDays.filter(d => d !== day)
      : [...formData.openDays, day]
    )
  }

  async function handleFinish() {
    if (!session?.user?.id) {
      toast.error('Not signed in')
      return
    }
    setSaving(true)
    try {
      await onboardingActions.saveOnboarding(
        session.user.id,
        {
          name:             formData.shopName,
          description:      formData.description,
          phone:            formData.phone,
          line_id:          formData.lineId,
          pickup_radius_km: formData.pickupRadius,
          lat:              formData.lat,
          lng:              formData.lng,
        },
        {
          accepted_materials:  formData.selectedMaterials,
          open_days:           formData.openDays,
          onboarding_complete: true,
        }
      )

      toast.success('Shop submitted for review')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.message ?? 'Failed to save — please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <OnbStepper step={step} />

      {/* Step 1 */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-brand text-[28px] m-0">Tell us about your shop</h2>
          <p className="font-body text-[14px] text-[var(--ink-3)] m-0">
            This information will appear on your public shop profile.
          </p>

          <div className="flex flex-col gap-1">
            <label className="font-data text-[11px] uppercase tracking-widest text-[var(--ink-3)]">Shop Name *</label>
            <input
              className={INPUT_CLS}
              value={formData.shopName}
              onChange={e => set('shopName', e.target.value)}
              placeholder="e.g. Green Recycling"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-data text-[11px] uppercase tracking-widest text-[var(--ink-3)]">Description</label>
            <textarea
              className={INPUT_CLS}
              rows={3}
              value={formData.description}
              onChange={e => set('description', e.target.value)}
              placeholder="What makes your shop special?"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-data text-[11px] uppercase tracking-widest text-[var(--ink-3)]">Phone</label>
            <input
              className={INPUT_CLS}
              type="tel"
              value={formData.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="08x-xxx-xxxx"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-data text-[11px] uppercase tracking-widest text-[var(--ink-3)]">LINE ID</label>
            <input
              className={INPUT_CLS}
              value={formData.lineId}
              onChange={e => set('lineId', e.target.value)}
              placeholder="@yourlineid"
            />
          </div>

          <div className="flex justify-end mt-2">
            <button
              className={BTN_PRIMARY}
              disabled={!formData.shopName.trim()}
              onClick={() => setStep(2)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-brand text-[28px] m-0">Materials you buy</h2>
          <p className="font-body text-[14px] text-[var(--ink-3)] m-0">
            Select all material types your shop accepts.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {Object.keys(WASTE_ITEMS).map(key => {
              const on = formData.selectedMaterials.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleMaterial(key)}
                  className={[
                    'py-3 px-4 text-left border-[1.5px] font-body text-[14px] cursor-pointer transition-colors',
                    on
                      ? 'bg-[var(--green)] border-[var(--ink)] text-[var(--ink)]'
                      : 'bg-[var(--paper-2)] border-[var(--ink-4)] text-[var(--ink-3)]',
                  ].join(' ')}
                >
                  {localName(key, 'en')}
                </button>
              )
            })}
          </div>

          <div className="flex justify-between mt-2">
            <button className={BTN_SECONDARY} onClick={() => setStep(1)}>Back</button>
            <button
              className={BTN_PRIMARY}
              disabled={formData.selectedMaterials.length === 0}
              onClick={() => setStep(3)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-brand text-[28px] m-0">Location &amp; hours</h2>
          <p className="font-body text-[14px] text-[var(--ink-3)] m-0">
            Set the days you accept pickups and your service radius.
          </p>

          <div className="flex flex-col gap-1">
            <label className="font-data text-[11px] uppercase tracking-widest text-[var(--ink-3)]">Shop Location *</label>
            <LocationPicker
              lat={formData.lat}
              lng={formData.lng}
              onChange={(lat, lng) => { set('lat', lat); set('lng', lng) }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-data text-[11px] uppercase tracking-widest text-[var(--ink-3)]">Open days</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map(day => {
                const on = formData.openDays.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={[
                      'px-3 py-2 border-[1.5px] font-data text-[12px] uppercase cursor-pointer transition-colors',
                      on
                        ? 'bg-[var(--ink)] border-[var(--ink)] text-[var(--paper)]'
                        : 'bg-[var(--paper-2)] border-[var(--ink-4)] text-[var(--ink-3)]',
                    ].join(' ')}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-data text-[11px] uppercase tracking-widest text-[var(--ink-3)]">
              Pickup radius (km)
            </label>
            <input
              className={INPUT_CLS}
              type="number"
              min={1}
              max={50}
              value={formData.pickupRadius}
              onChange={e => set('pickupRadius', Number(e.target.value))}
            />
          </div>

          <div className="flex justify-between mt-2">
            <button className={BTN_SECONDARY} onClick={() => setStep(2)}>Back</button>
            <button
              className={BTN_PRIMARY}
              disabled={saving || formData.openDays.length === 0}
              onClick={handleFinish}
            >
              {saving ? 'Saving...' : 'Finish setup'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
