import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import wasteReducer from './wasteSlice'
import marketplaceReducer from './marketplaceSlice'
import aiConfigReducer from './aiConfigSlice'
import bookingReducer from './bookingSlice'
import buyerReducer from './buyerSlice'
import notificationReducer from './notificationSlice'
import scheduleReducer from './scheduleSlice'
import pricingReducer from './pricingSlice'
import customLabelsReducer from './customLabelsSlice'
import logisticsReducer from './logisticsSlice'
import chatReducer from './chatSlice'

export const store = configureStore({
  reducer: {
    user:          userReducer,
    waste:         wasteReducer,
    marketplace:   marketplaceReducer,
    aiConfig:      aiConfigReducer,
    bookings:      bookingReducer,
    buyer:         buyerReducer,
    notifications: notificationReducer,
    schedule:      scheduleReducer,
    pricing:       pricingReducer,
    customLabels:  customLabelsReducer,
    logistics:     logisticsReducer,
    chat:          chatReducer,
  },
})
