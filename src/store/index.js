import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import wasteReducer from './wasteSlice'
import marketplaceReducer from './marketplaceSlice'
import aiConfigReducer from './aiConfigSlice'
import bookingReducer from './bookingSlice'
import scheduleReducer from './scheduleSlice'
import notificationReducer from './notificationSlice'
import pricingReducer from './pricingSlice'

export const store = configureStore({
  reducer: {
    user:          userReducer,
    waste:         wasteReducer,
    marketplace:   marketplaceReducer,
    aiConfig:      aiConfigReducer,
    bookings:      bookingReducer,
    schedule:      scheduleReducer,
    notifications: notificationReducer,
    pricing:       pricingReducer,
  },
})
