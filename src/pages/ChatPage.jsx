import { useState, useRef, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useChat } from '../hooks/useChat'
import { ChatOfferModal } from '../components/ChatOfferModal'

function FileMessage({ msg }) {
  const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(msg.attachment_url ?? '')
  if (isImage) {
    return (
      <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
        <img
          src={msg.attachment_url}
          alt={msg.attachment_name ?? 'image'}
          className="max-w-full max-h-48 block border-[1.5px] border-[var(--ink)]"
        />
      </a>
    )
  }
  const kb = msg.attachment_size ? ` · ${Math.round(msg.attachment_size / 1024)} KB` : ''
  return (
    <a
      href={msg.attachment_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 font-data text-[12px] text-[var(--ink)] underline"
    >
      <span>📄</span>
      <span>{msg.attachment_name ?? msg.body}{kb}</span>
    </a>
  )
}

function VoiceMessage({ msg }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-data text-[10px] text-[var(--ink-3)]">🎤 {msg.body}</span>
      {msg.attachment_url && (
        <audio controls src={msg.attachment_url} className="h-8 max-w-[200px]" />
      )}
    </div>
  )
}

export function ChatPage() {
  const { roomId: routeRoomId } = useParams()
  const { rooms, activeRoomId, messages, sendMessage, sendFile, sendVoice, setActiveRoom } = useChat()
  const session  = useSelector(s => s.user.session)
  const language = useSelector(s => s.user.language)
  const [draft, setDraft]           = useState('')
  const [offerOpen, setOfferOpen]   = useState(false)
  const [dialOpen, setDialOpen]     = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [recording, setRecording]   = useState(false)
  const [mobileView, setMobileView] = useState(() => routeRoomId ? 'thread' : 'rooms')
  const bottomRef        = useRef(null)
  const fileInputRef     = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef        = useRef([])
  const recordStartRef   = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    try {
      await sendFile(file)
    } catch (err) {
      toast.error(err.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const startRecording = useCallback(async () => {
    if (recording) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.start()
      mediaRecorderRef.current = mr
      recordStartRef.current = Date.now()
      setRecording(true)
    } catch {
      toast.error('Microphone not available')
    }
  }, [recording])

  const stopRecording = useCallback(async () => {
    if (!recording || !mediaRecorderRef.current) return
    const mr = mediaRecorderRef.current
    const duration = (Date.now() - (recordStartRef.current ?? Date.now())) / 1000
    await new Promise(resolve => { mr.onstop = resolve; mr.stop() })
    mr.stream.getTracks().forEach(t => t.stop())
    mediaRecorderRef.current = null
    setRecording(false)
    if (chunksRef.current.length === 0) return
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    setUploading(true)
    try {
      await sendVoice(blob, duration)
    } catch (err) {
      toast.error(err.message ?? 'Voice send failed')
    } finally {
      setUploading(false)
    }
  }, [recording, sendVoice])

  const activeRoom = rooms.find(r => r.id === activeRoomId)

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* Room list — full screen on mobile when mobileView==='rooms', sidebar on md+ */}
      <div
        className={[
          'flex-shrink-0 border-r-[1.5px] border-[var(--ink-4)] flex-col overflow-y-auto',
          'md:flex md:w-[280px]',
          mobileView === 'rooms' ? 'flex w-full' : 'hidden',
        ].join(' ')}
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
            onClick={() => { setActiveRoom(room.id); setMobileView('thread') }}
            className="w-full text-left px-4 py-3 border-b-[1px] border-[var(--ink-4)] cursor-pointer transition-colors hover:bg-[var(--paper-2)]"
            style={{
              background: room.id === activeRoomId ? 'var(--green-soft)' : 'transparent',
              borderLeft: room.id === activeRoomId ? '3px solid var(--green)' : '3px solid transparent',
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,audio/*,application/pdf,text/plain"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Message thread — hidden on mobile when showing room list */}
      <div
        className={['flex-1 flex flex-col overflow-hidden', mobileView === 'rooms' ? 'hidden md:flex' : 'flex'].join(' ')}
        style={{ background: 'var(--paper)' }}
      >
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
              <button
                onClick={() => setMobileView('rooms')}
                className="md:hidden flex-shrink-0 font-data text-[11px] uppercase tracking-widest text-[var(--ink-3)] border-[1.5px] border-[var(--ink-4)] px-2 py-1 hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <h2 className="font-brand text-[16px] text-[var(--ink)] m-0">
                {activeRoom?.shop?.name ?? 'Chat'}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {messages.map(msg => {
                const isOwn   = msg.sender_id === session?.user?.id
                const isFile  = msg.type === 'file'
                const isVoice = msg.type === 'voice'
                const isOffer = !isFile && !isVoice && msg.body.startsWith('[OFFER:')
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
                      {isFile  && <FileMessage msg={msg} />}
                      {isVoice && <VoiceMessage msg={msg} />}
                      {!isFile && !isVoice && (
                        <>
                          {isOffer && (
                            <div className="font-data text-[9px] text-[var(--green-ink)] uppercase tracking-widest mb-1">
                              Offer
                            </div>
                          )}
                          <span className={isOffer ? 'font-data text-[13px]' : ''}>
                            {isOffer ? msg.body.replace(/^\[OFFER:[^\]]+\] /, '') : msg.body}
                          </span>
                        </>
                      )}
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
                      onClick={() => { setDialOpen(false); fileInputRef.current?.click() }}
                      disabled={uploading}
                      className="w-9 h-9 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] font-data text-[14px] shadow-[2px_2px_0_var(--ink)] cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Send file"
                    >
                      📎
                    </button>
                    <button
                      onPointerDown={() => { setDialOpen(false); startRecording() }}
                      onPointerUp={stopRecording}
                      onPointerLeave={stopRecording}
                      disabled={uploading}
                      className={[
                        'w-9 h-9 border-[1.5px] border-[var(--ink)] font-data text-[14px] shadow-[2px_2px_0_var(--ink)] cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed select-none',
                        recording ? 'bg-[#e00] text-white animate-pulse' : 'bg-[var(--paper)] text-[var(--ink)]',
                      ].join(' ')}
                      title={recording ? 'Recording… release to send' : 'Hold to record voice'}
                    >
                      🎤
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setDialOpen(d => !d)}
                  className={[
                    'w-10 h-10 border-[1.5px] border-[var(--ink)] bg-[var(--green)] text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] cursor-pointer font-data text-[20px] leading-none flex items-center justify-center transition-transform duration-150',
                    dialOpen ? 'rotate-45' : '',
                  ].join(' ')}
                >
                  +
                </button>
              </div>

              {uploading ? (
                <div className="flex-1 flex items-center px-3 font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest animate-pulse border-[1.5px] border-[var(--ink-4)] py-2">
                  {recording ? 'Sending voice…' : 'Uploading…'}
                </div>
              ) : (
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  rows={1}
                  className="flex-1 border-[1.5px] border-[var(--ink)] px-3 py-2 font-body text-[14px] bg-[var(--paper)] outline-none focus:border-[var(--green)] resize-none transition-colors"
                />
              )}

              <button
                onClick={handleSend}
                disabled={!draft.trim() || uploading}
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
