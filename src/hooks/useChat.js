import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setRooms, setActiveRoom, setMessages, appendMessage } from '../store/chatSlice'

const BUCKET = 'chat-attachments'

export function useChat() {
  const dispatch  = useDispatch()
  const session   = useSelector(s => s.user.session)
  const { rooms, activeRoomId, messages } = useSelector(s => s.chat)

  useEffect(() => {
    if (!session?.user?.id) return

    async function loadRooms() {
      // RLS policy already filters to rooms where current user is the
      // user_id or the shop owner — no complex subquery needed here.
      const { data } = await supabase
        .from('chat_rooms')
        .select('*, shop:shop_id(name), last_msg:messages(body, type, created_at)')
        .order('created_at', { ascending: false })
      if (data) {
        // Sort last_msg descending so index [0] = latest message
        dispatch(setRooms(data.map(r => ({
          ...r,
          last_msg: (r.last_msg ?? []).sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          ),
        }))))
      }
    }
    loadRooms()
  }, [session, dispatch])

  useEffect(() => {
    if (!activeRoomId) return

    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', activeRoomId)
        .order('created_at', { ascending: true })
      if (data) dispatch(setMessages(data))
    }
    loadMessages()

    const channel = supabase
      .channel(`room-${activeRoomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${activeRoomId}`,
      }, payload => {
        dispatch(appendMessage(payload.new))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [activeRoomId, dispatch])

  const sendMessage = useCallback(async (body) => {
    if (!activeRoomId || !body.trim() || !session?.user?.id) return
    await supabase.from('messages').insert({
      room_id:   activeRoomId,
      sender_id: session.user.id,
      body:      body.trim(),
      type:      'text',
    })
  }, [activeRoomId, session])

  const sendFile = useCallback(async (file) => {
    if (!activeRoomId || !file || !session?.user?.id) return
    const ext  = file.name.split('.').pop()
    const path = `${activeRoomId}/${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })
    if (upErr) throw new Error(upErr.message)

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)

    await supabase.from('messages').insert({
      room_id:         activeRoomId,
      sender_id:       session.user.id,
      body:            file.name,
      type:            'file',
      attachment_url:  urlData.publicUrl,
      attachment_name: file.name,
      attachment_size: file.size,
    })
  }, [activeRoomId, session])

  const sendVoice = useCallback(async (blob, durationSec) => {
    if (!activeRoomId || !blob || !session?.user?.id) return
    const path = `${activeRoomId}/voice-${Date.now()}.webm`

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: 'audio/webm', upsert: false })
    if (upErr) throw new Error(upErr.message)

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)

    await supabase.from('messages').insert({
      room_id:        activeRoomId,
      sender_id:      session.user.id,
      body:           `${Math.round(durationSec)}s`,
      type:           'voice',
      attachment_url: urlData.publicUrl,
    })
  }, [activeRoomId, session])

  const openOrCreateRoom = useCallback(async (shopId) => {
    if (!session?.user?.id) return null
    const { data: existing } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('shop_id', shopId)
      .maybeSingle()
    if (existing) {
      dispatch(setActiveRoom(existing.id))
      return existing.id
    }
    const { data: created } = await supabase
      .from('chat_rooms')
      .insert({ user_id: session.user.id, shop_id: shopId })
      .select()
      .single()
    if (created) {
      dispatch(setActiveRoom(created.id))
      return created.id
    }
    return null
  }, [session, dispatch])

  return {
    rooms,
    activeRoomId,
    messages,
    sendMessage,
    sendFile,
    sendVoice,
    openOrCreateRoom,
    setActiveRoom: (id) => dispatch(setActiveRoom(id)),
  }
}
