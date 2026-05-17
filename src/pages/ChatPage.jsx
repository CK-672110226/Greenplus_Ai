import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat'

export function ChatPage() {
  const { rooms, activeRoomId, messages, sendMessage, setActiveRoom } = useChat()
  const session  = useSelector(s => s.user.session)
  const [draft, setDraft] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
                const isOwn = msg.sender_id === session?.user?.id
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[72%] px-3 py-2 font-body text-[14px]"
                      style={{
                        background: isOwn ? 'var(--green)' : 'var(--paper-2)',
                        color:      'var(--ink)',
                        border:     '1.5px solid var(--ink)',
                        boxShadow:  '2px 2px 0 var(--ink)',
                      }}
                    >
                      {msg.body}
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
              className="px-5 py-3 border-t-[1.5px] border-[var(--ink-4)] flex gap-3 items-end"
              style={{ background: 'var(--paper)' }}
            >
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
