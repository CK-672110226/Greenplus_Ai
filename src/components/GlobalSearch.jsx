import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { WASTE_ITEMS, localName } from '../data/wasteItems'
import { useShops } from '../hooks/useShops'

const USER_PAGES = [
  { id: 'home',        label: 'Home',         sub: 'Your scan activity',    icon: '⌂', path: '/home' },
  { id: 'scan',        label: 'Scan',         sub: 'AI waste scanner',      icon: '◉', path: '/scan' },
  { id: 'basket',      label: 'Basket',       sub: 'Your items to sell',    icon: '◻', path: '/basket' },
  { id: 'map',         label: 'Nearby Shops', sub: 'Find a recycling shop', icon: '◎', path: '/map' },
  { id: 'marketplace', label: 'Marketplace',  sub: 'Browse listings',       icon: '◈', path: '/marketplace' },
  { id: 'chat',        label: 'Messages',     sub: 'Chat with shops',       icon: '◫', path: '/chat' },
  { id: 'profile',     label: 'Profile',      sub: 'Your account',          icon: '◯', path: '/profile' },
  { id: 'settings',    label: 'Settings',     sub: 'Preferences',           icon: '⊙', path: '/settings' },
]

const BUYER_PAGES = [
  { id: 'dashboard',   label: 'Dashboard',    sub: 'Today\'s haul & KPIs',  icon: '⌂', path: '/dashboard' },
  { id: 'schedule',    label: 'Schedule',     sub: 'Pickup schedule',       icon: '◰', path: '/schedule' },
  { id: 'rider',       label: 'Smart Route',  sub: 'Optimise pickup route', icon: '◎', path: '/rider' },
  { id: 'marketplace', label: 'Marketplace',  sub: 'Browse listings',       icon: '◈', path: '/marketplace' },
  { id: 'pricing',     label: 'Pricing',      sub: 'Set material prices',   icon: '◇', path: '/pricing' },
  { id: 'chat',        label: 'Messages',     sub: 'Chat with sellers',     icon: '◫', path: '/chat' },
  { id: 'notifications', label: 'Notifications', sub: 'Alerts & updates',   icon: '◉', path: '/notifications' },
  { id: 'profile',     label: 'Profile',      sub: 'Your account',          icon: '◯', path: '/profile' },
  { id: 'settings',    label: 'Settings',     sub: 'Preferences',           icon: '⊙', path: '/settings' },
]

export function GlobalSearch({ isOpen, onClose }) {
  if (!isOpen) return null
  return <SearchPanel onClose={onClose} />
}

function SearchPanel({ onClose }) {
  const navigate = useNavigate()
  const language = useSelector(s => s.user.language)
  const role     = useSelector(s => s.user.profile?.role)
  const { shops } = useShops()
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(timer)
  }, [])

  const q = query.toLowerCase().trim()
  const pages = role === 'buyer' ? BUYER_PAGES : USER_PAGES
  const shopPath = role === 'buyer' ? '/marketplace' : '/map'

  const pageResults = pages
    .filter(p => !q || p.label.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q))
    .slice(0, 5)
    .map(p => ({ ...p, type: 'page' }))

  const materialResults = Object.keys(WASTE_ITEMS)
    .filter(k => !q || localName(k, language).toLowerCase().includes(q) || k.toLowerCase().includes(q))
    .slice(0, 5)
    .map(k => ({ id: k, label: localName(k, language), sub: 'Material', icon: '▨', type: 'material', path: '/marketplace' }))

  const shopResults = (shops ?? [])
    .filter(s => !q || s.name?.toLowerCase().includes(q) || s.area?.toLowerCase().includes(q))
    .slice(0, 5)
    .map(s => ({ id: s.id, label: s.name, sub: s.area ?? 'Shop', icon: '◰', type: 'shop', path: shopPath }))

  const allResults = [...pageResults, ...materialResults, ...shopResults]

  function handleSelect(item) {
    navigate(item.path)
    onClose()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, allResults.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
    if (e.key === 'Enter' && allResults[cursor]) { handleSelect(allResults[cursor]) }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-4 flex flex-col overflow-hidden"
        style={{
          background: 'var(--paper)',
          border: '1.5px solid var(--ink)',
          boxShadow: '4px 4px 0 var(--ink)',
          maxHeight: '70vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b-[1.5px] border-[var(--ink-4)]">
          <span className="font-data text-[16px] text-[var(--ink-3)]">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, shops, materials…"
            className="flex-1 bg-transparent font-body text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-4)]"
          />
          <button
            onClick={onClose}
            className="font-data text-[10px] uppercase tracking-widest text-[var(--ink-3)] border-[1px] border-[var(--ink-4)] px-1.5 py-0.5 cursor-pointer hover:border-[var(--ink)] bg-transparent"
          >
            esc
          </button>
        </div>

        <div className="overflow-y-auto flex flex-col">
          {allResults.length === 0 && (
            <div className="px-5 py-8 font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest text-center">
              No results
            </div>
          )}

          {pageResults.length > 0 && (
            <ResultSection label="Pages" results={pageResults} allResults={allResults} cursor={cursor} onSelect={handleSelect} setCursor={setCursor} />
          )}
          {materialResults.length > 0 && (
            <ResultSection label="Materials" results={materialResults} allResults={allResults} cursor={cursor} onSelect={handleSelect} setCursor={setCursor} />
          )}
          {shopResults.length > 0 && (
            <ResultSection label="Shops" results={shopResults} allResults={allResults} cursor={cursor} onSelect={handleSelect} setCursor={setCursor} />
          )}
        </div>

        <div className="px-4 py-2 border-t-[1px] border-[var(--ink-4)] flex gap-4">
          <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-widest">↑↓ navigate</span>
          <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-widest">↵ open</span>
          <span className="font-data text-[9px] text-[var(--ink-4)] uppercase tracking-widest">esc close</span>
        </div>
      </div>
    </div>
  )
}

function ResultSection({ label, results, allResults, cursor, onSelect, setCursor }) {
  return (
    <div>
      <div className="px-4 pt-3 pb-1 font-data text-[9px] uppercase tracking-widest text-[var(--ink-3)]">{label}</div>
      {results.map(item => {
        const globalIdx = allResults.findIndex(r => r.id === item.id && r.type === item.type)
        const isActive = globalIdx === cursor
        return (
          <button
            key={`${item.type}-${item.id}`}
            onClick={() => onSelect(item)}
            onMouseEnter={() => setCursor(globalIdx)}
            className="w-full text-left px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors bg-transparent border-none"
            style={{
              background: isActive ? 'var(--green-soft)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--green)' : '3px solid transparent',
            }}
          >
            <span className="font-data text-[18px] text-[var(--ink-3)] w-6 flex-shrink-0">{item.icon}</span>
            <div className="flex flex-col min-w-0">
              <span className="font-body text-[14px] text-[var(--ink)] truncate">{item.label}</span>
              <span className="font-data text-[10px] text-[var(--ink-3)] truncate">{item.sub}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
