import { configureStore } from '@reduxjs/toolkit'

// NOTE: Все же решил в этот раз не использовать mws
// import { apiSlice } from './api/apiSlice'

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import { newsReducer } from './reducers/newsSlice'

const store = configureStore({
  reducer: {
    // [apiSlice.reducerPath]: apiSlice.reducer,
    news: newsReducer,
  },
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger, apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export { store }
