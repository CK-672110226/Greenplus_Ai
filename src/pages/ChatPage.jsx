import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat'
import { ChatOfferModal } from '../components/ChatOfferModal'

export function ChatPage() {
  const { rooms, activeRoomId, messages, sendMessage, setActiveRoom } = useChat()
  const session  = useSelector(s => s.user.session)
  const language = useSelector(s => s.user.language)
  const [draft, setDraft]           = useState('')
  const [offerOpen, setOfferOpen]   = useState(false)
  const [dialOpen, setDialOpen]     = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark current room as read whenever messages change
  useEffect(() => {
    if (!activeRoomId || messages.length === 0) return
    const latest = messages[messages.length - 1]
    if (!latest) return
    const lastRead = JSON.parse(localStorage.getItem('chat_lastRead') ?? '{}')
    lastRead[activeRoomId] = latest.created_at
    localStorage.setItem('chat_lastRead', JSON.stringify(lastRead))
  }, [activeRoomId, messages])

  async function handleSend() {
    if (!draft.trim()) return
    await sendMessage(draft)
    setDraft('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleOffer(offer) {
    const side = offer.side ?? 'sell'
    const body = [
      `[OFFER:${side}] ${offer.material}`,
      `฿${offer.price}/kg`,
      offer.weight ? `${offer.weight}kg` : null,
      offer.date   ? offer.date           : null,
    ].filter(Boolean).join(' \xB7 ')
    await sendMessage(body)
  }

  const activeRoom = rooms.find(r => r.id === activeRoomId)

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* Room list — hidden on mobile, visible md+ */}
      <div
        className="w-[280px] flex-shrink-0 border-r-[1.5px] border-[var(--ink-4)] flex-col overflow-y-auto hidden md:flex"
        style={{ background: 'var(--paper)' }}
      >
        <div className="p-4 border-b-[1.5px] border-[var(--ink-4)]">
          <h1 className="font-brand text-[20px] text-[var(--ink)] m-0">Messages</h1>
        </div>

        {rooms.length === 0 && (
          <div className="p-6 font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
            No conversations yet
          </div>
        )}

        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => setActiveRoom(room.id)}
            className="w-full text-left px-4 py-3 border-b-[1px] border-[var(--ink-4)] cursor-pointer transition-colors hover:bg-[var(--paper-2)]"
            style={{
              background:  room.id === activeRoomId ? 'var(--green-soft)' : 'transparent',
              borderLeft:  room.id === activeRoomId ? '3px solid var(--green)' : '3px solid transparent',
            }}
          >
            <div className="font-body text-[14px] text-[var(--ink)] truncate">
              {room.shop?.name ?? 'Shop'}
            </div>
            <div className="font-data text-[11px] text-[var(--ink-3)] truncate mt-0.5">
              {room.last_msg?.[0]?.body ?? 'No messages yet'}
            </div>
          </button>
        ))}
      </div>

      {/* Offer modal */}
      {offerOpen && (
        <ChatOfferModal
          language={language}
          onSend={handleOffer}
          onClose={() => setOfferOpen(false)}
        />
      )}

      {/* Message thread */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--paper)' }}>
        {!activeRoomId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="font-data text-[12px] text-[var(--ink-3)] uppercase tracking-widest text-center">
              Select a conversation
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="px-5 py-3 border-b-[1.5px] border-[var(--ink-4)] flex items-center gap-3">
              <h2 className="font-brand text-[16px] text-[var(--ink)] m-0">
                {activeRoom?.shop?.name ?? 'Chat'}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {messages.map(msg => {
                const isOwn   = msg.sender_id === session?.user?.id
                const isOffer = msg.body.startsWith('[OFFER:')
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[72%] px-3 py-2 font-body text-[14px]"
                      style={{
                        background: isOffer
                          ? 'var(--green-soft)'
                          : isOwn ? 'var(--green)' : 'var(--paper-2)',
                        color:     'var(--ink)',
                        border:    isOffer ? '1.5px solid var(--green)' : '1.5px solid var(--ink)',
                        boxShadow: '2px 2px 0 var(--ink)',
                      }}
                    >
                      {isOffer && (
                        <div className="font-data text-[9px] text-[var(--green-ink)] uppercase tracking-widest mb-1">
                          Offer
                        </div>
                      )}
                      <span className={isOffer ? 'font-data text-[13px]' : ''}>
                        {isOffer ? msg.body.replace(/^\[OFFER:[^\]]+\] /, '') : msg.body}
                      </span>
                      <div className="font-data text-[9px] text-[var(--ink-3)] mt-1 text-right">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div
              className="px-5 py-3 border-t-[1.5px] border-[var(--ink-4)] flex gap-2 items-end"
              style={{ background: 'var(--paper)' }}
            >
              {/* Speed dial FAB */}
              <div className="relative flex-shrink-0">
                {/* Speed dial sub-buttons */}
                {dialOpen && (
                  <div className="absolute bottom-12 left-0 flex flex-col gap-2 items-center">
                    <button
                      onClick={() => { setDialOpen(false); setOfferOpen(true) }}
                      className="w-9 h-9 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] font-data text-[9px] uppercase tracking-wide shadow-[2px_2px_0_var(--ink)] cursor-pointer flex items-center justify-center"
                      title="Offer"
                    >
                      ฿
                    </button>
                    <button
                      className="w-9 h-9 border-[1.5px] border-[var(--ink-4)] bg-[var(--paper-2)] text-[var(--ink-3)] font-data text-[9px] uppercase shadow-[1px_1px_0_var(--ink-4)] cursor-not-allowed flex items-center justify-center"
                      title="Photo (coming soon)"
                      disabled
                    >
                      ☐
                    </button>
                    <button
                      className="w-9 h-9 border-[1.5px] border-[var(--ink-4)] bg-[var(--paper-2)] text-[var(--ink-3)] font-data text-[9px] uppercase shadow-[1px_1px_0_var(--ink-4)] cursor-not-allowed flex items-center justify-center"
                      title="Voice (coming soon)"
                      disabled
                    >
                      ♪
                    </button>
                  </div>
                )}
                {/* Main FAB */}
                <button
                  onClick={() => setDialOpen(d => !d)}
                  className={[
                    'w-10 h-10 border-[1.5px] border-[var(--ink)] bg-[var(--green)] text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] cursor-pointer font-data text-[20px] leading-none flex items-center justify-center transition-transform duration-150',
                    dialOpen ? 'rotate-45' : ''
                  ].join(' ')}
                >
                  +
                </button>
              </div>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send)"
                rows={1}
                className="flex-1 border-[1.5px] border-[var(--ink)] px-3 py-2 font-body text-[14px] bg-[var(--paper)] outline-none focus:border-[var(--green)] resize-none transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!draft.trim()}
                className="px-4 py-2 bg-[var(--ink)] text-[var(--paper)] font-data text-[12px] uppercase tracking-widest border-[1.5px] border-[var(--ink)] cursor-pointer hover:bg-[var(--green)] hover:text-[var(--ink)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
