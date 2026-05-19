import { createSlice } from '@reduxjs/toolkit'

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    rooms: [],
    activeRoomId: null,
    messages: [],
  },
  reducers: {
    setRooms:      (state, action) => { state.rooms = action.payload },
    setActiveRoom: (state, action) => { state.activeRoomId = action.payload },
    setMessages:   (state, action) => { state.messages = action.payload },
    appendMessage: (state, action) => { state.messages.push(action.payload) },
    updateRoomLastMsg: (state, action) => {
      const { roomId, msg } = action.payload
      const room = state.rooms.find(r => r.id === roomId)
      if (room) room.last_msg = [msg, ...(room.last_msg ?? []).slice(0, 4)]
    },
    clearChat:     (state) => { state.rooms = []; state.activeRoomId = null; state.messages = [] },
  },
})

export const { setRooms, setActiveRoom, setMessages, appendMessage, updateRoomLastMsg, clearChat } = chatSlice.actions
export default chatSlice.reducer
