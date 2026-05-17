import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setRooms, setActiveRoom, setMessages, appendMessage } from '../store/chatSlice'

export function useChat() {
  const dispatch  = useDispatch()
  const session   = useSelector(s => s.user.session)
  const { rooms, activeRoomId, messages } = useSelector(s => s.chat)

  useEffect(() => {
    if (!session?.user?.id) return

    async function loadRooms() {
      const { data } = await supabase
        .from('chat_rooms')
        .select('*, shop:shop_id(name), last_msg:messages(body, created_at)')
        .or(`user_id.eq.${session.user.id},shop_id.in.(select id from shops where owner_id='${session.user.id}')`)
        .order('created_at', { ascending: false })
      if (data) dispatch(setRooms(data))
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
      room_id: activeRoomId,
      sender_id: session.user.id,
      body: body.trim(),
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
    openOrCreateRoom,
    setActiveRoom: (id) => dispatch(setActiveRoom(id)),
  }
}
