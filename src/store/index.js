import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/es/storage'

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

const wastePersistConfig  = { key: 'waste',   storage, whitelist: ['basket', 'lastScan'] }
const pricingPersistConfig = { key: 'pricing', storage, whitelist: ['prices', 'savedAt'] }

const rootReducer = combineReducers({
  user:          userReducer,
  waste:         persistReducer(wastePersistConfig, wasteReducer),
  marketplace:   marketplaceReducer,
  aiConfig:      aiConfigReducer,
  bookings:      bookingReducer,
  buyer:         buyerReducer,
  notifications: notificationReducer,
  schedule:      scheduleReducer,
  pricing:       persistReducer(pricingPersistConfig, pricingReducer),
  customLabels:  customLabelsReducer,
  logistics:     logisticsReducer,
  chat:          chatReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
