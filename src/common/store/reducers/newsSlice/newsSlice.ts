import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TNewsState, TNewsItemDetails, ENewsMode } from './types'
import { NResponse } from '~/common/utils/httpClient/types'
import { NWService } from '~/common/utils/wws/types';
import { compareDESC } from '~/common/utils/number-ops'

// Define the initial state for the slice
const initialState: TNewsState = {
  newsMode: ENewsMode.NEW,
  items: [],
  details: {},
  mainRequestResult: undefined,
  pollingCounter: 0,
  errors: {},
  loadedItemsCounters: {
    [ENewsMode.ASK]: 0,
    [ENewsMode.BEST]: 0,
    [ENewsMode.JOB]: 0,
    [ENewsMode.NEW]: 0,
    [ENewsMode.SHOW]: 0,
    [ENewsMode.TOP]: 0,
    [ENewsMode.FAV]: 0,
  },
  persistedFavorites: [],
};

// Create the slice
const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNewsItemData: (state, action: PayloadAction<NWService.TNewsItemDataResult<TNewsItemDetails>>) => {
      switch (true) {
        case typeof action.payload.originalResponse?.id === 'number':
          if (
            state.items.includes(action.payload.originalResponse.id)
            && typeof state.details[String(action.payload.originalResponse.id)] === 'undefined'
          ) {
            state.loadedItemsCounters[state.newsMode] += 1
          }
          state.details[String(action.payload.originalResponse.id)] = action.payload.originalResponse

          // NOTE: Remove error message if exists
          if (!!state.errors[String(action.payload.originalResponse.id)])
            delete state.errors[String(action.payload.originalResponse.id)]
          break
        default:
          break
      } 
    },
    setNewsItemError: (state, action: PayloadAction<{ id: number; reason: string; }>) => {
      state.errors[String(action.payload.id)] = action.payload.reason
    },
    setMainRequestResult: (state, action: PayloadAction<{ result: NResponse.TMinimalStandart<number[]>}>) => {
      state.mainRequestResult = action.payload.result
      if (Array.isArray(action.payload.result.targetResponse)) {
        // NOTE: (v1) Хотя, проверка на массив чисел уже была пройдена
        // state.items = action.payload.result.targetResponse

        // NOTE: (v2) По ТЗ требуется оставить последние 100, предварительно отсортировав
        const uiLimit = 100
        const sortedIds = [...action.payload.result.targetResponse].sort(compareDESC)
        const someLast = []
        for (let i = 0, max = uiLimit; i < max; i++) {
          if (!sortedIds[i]) break
          someLast.push(sortedIds[i])
        }
        state.items = someLast
      }
    },
    resetMainRequestResult: (state) => {
      state.mainRequestResult = undefined
      // NOTE: Reset target counter
      // state.loadedItemsCounters[state.newsMode] = 0
    },
    refreshPolling: (state) => {
      for (const key in state.details) delete state.details[key]
      state.items = []
      state.errors = {}
      state.loadedItemsCounters[state.newsMode] = 0
      state.pollingCounter += 1
    },
    resetNewsItemData: (state, action: PayloadAction<{ id: number; }>) => {
      if (state.details[String(action.payload.id)]) state.loadedItemsCounters[state.newsMode] -= 1

      delete state.details[String(action.payload.id)]
      delete state.errors[String(action.payload.id)]
    },
    setNewsMode: (state, action: PayloadAction<{ mode: ENewsMode; }>) => {
      state.loadedItemsCounters[action.payload.mode] = 0
      state.newsMode = action.payload.mode
      for (const key in state.details) delete state.details[key]
      state.items = []
      state.errors = {}
      state.pollingCounter += 1
    },
    addToPersistedFavorites: (state, action: PayloadAction<{ id: number; }>) => {
      const limit = 1000
      switch (true) {
        case state.persistedFavorites.length >= limit:
          // NOTE: Remove last, add first
          state.persistedFavorites.pop()
          state.persistedFavorites.unshift(action.payload.id)
          break
        default:
          state.persistedFavorites.unshift(action.payload.id)
          break
      }
      if (state.newsMode === ENewsMode.FAV) state.pollingCounter += 1
    },
    removeFromPersistedFavorites: (state, action: PayloadAction<{ id: number; }>) => {
      state.persistedFavorites = state.persistedFavorites.filter((id) => id !== action.payload.id)
      if (state.newsMode === ENewsMode.FAV) state.pollingCounter += 1
    },
  },
});

// Extract the reducer function from the slice
export const newsReducer = newsSlice.reducer

// Extract action creators from the slice
export const {
  setNewsMode,
  setMainRequestResult,
  setNewsItemData,
  refreshPolling,
  setNewsItemError,
  resetMainRequestResult,
  resetNewsItemData,
  addToPersistedFavorites,
  removeFromPersistedFavorites,
} = newsSlice.actions
