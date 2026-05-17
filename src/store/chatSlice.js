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
    clearChat:     (state) => { state.rooms = []; state.activeRoomId = null; state.messages = [] },
  },
})

export const { setRooms, setActiveRoom, setMessages, appendMessage, clearChat } = chatSlice.actions
export default chatSlice.reducer
