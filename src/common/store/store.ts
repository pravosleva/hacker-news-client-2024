/* eslint-disable @typescript-eslint/ban-ts-comment */
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { combineReducers } from 'redux'
import { newsReducer } from './reducers/newsSlice'
// NOTE: Все же решил в этот раз не использовать mws
// import { apiSlice } from './api/apiSlice'

// -- NOTE: 1/2 Persist root keys
// const rootPersistConfig = {
//   key: 'root',
//   storage,
//   whitelist: [],
// }
// --
const persistNewsConfig = {
  key: 'news',
  storage,
  whitelist: ['persistedFavorites']
}

const rootReducer = combineReducers({
  news: persistReducer(persistNewsConfig, newsReducer),
  // NOTE: etc.
})

// -- NOTE: 2/2 Persist root keys
// const store = configureStore({ reducer: persistReducer(rootPersistConfig, rootReducer) })
// --
const store = configureStore({ reducer: rootReducer })

// NOTE: This creates a persistor object
// & push that persisted object to .__persistor, so that we can avail the persistability feature
// @ts-ignore
store.__persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export { store }
