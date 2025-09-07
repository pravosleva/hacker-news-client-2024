import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TNewsState, TNewsItemDetails, ENewsMode, TMetaCacheSample } from './types'
import { NResponse } from '~/common/utils/httpClient/types'
import { NWService } from '~/common/utils/wws/types';
import { compareDESC, getHumanReadableSize } from '~/common/utils/number-ops'
// import { getLocalStorageSpace } from '~/common/utils/object-ops';
import jsonSize from 'json-size'

// Define the initial state for the slice
const initialState: TNewsState = {
  newsMode: ENewsMode.NEW,
  lastUpdateTs: new Date().getTime(),
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
  metaCache: {},
  // localStorageUsageInfo: getLocalStorageSpace({ getText: ({ bytes }) => `Total size: ${bytes} B` }),
  lsUsageInfo: {
    meta: '',
  },
};

// Create the slice
const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNewsItemData: (state, action: PayloadAction<NWService.TNewsItemDataResult<TNewsItemDetails>>) => {
      // console.log(action.payload.originalResponse)
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

          // state.localStorageUsageInfo = getLocalStorageSpace({
          //   getText: ({ bytes }) => `Total ${bytes} B`
          // })
          break
        default:
          break
      }
    },
    setNewsItemError: (state, action: PayloadAction<{ id: number; reason: string; }>) => {
      state.errors[String(action.payload.id)] = action.payload.reason
    },
    setMainRequestResult: (state, action: PayloadAction<{ result: NResponse.TMinimalStandart<number[]> }>) => {
      state.mainRequestResult = action.payload.result
      if (Array.isArray(action.payload.result.targetResponse)) {
        // NOTE: (v1) Хотя, проверка на массив чисел уже была пройдена
        // state.items = [...action.payload.result.targetResponse]

        // NOTE: (v2) По ТЗ требуется оставить последние 100, предварительно отсортировав
        const uiLimit = 1000000
        const sortedIds = [...action.payload.result.targetResponse].sort(compareDESC)
        switch (state.newsMode) {
          case ENewsMode.FAV:
            // NOTE: Не для избранных заметок
            state.items = sortedIds
            break
          default: {
            const someLast = []
            for (let i = 0, max = uiLimit; i < max; i++) {
              if (!sortedIds[i]) break
              someLast.push(sortedIds[i])
            }
            state.items = someLast
            break
          }
        }
        state.lastUpdateTs = new Date().getTime()
      }
    },
    resetMainRequestResult: (state) => {
      state.mainRequestResult = undefined
      // NOTE: Reset target counter
      // state.loadedItemsCounters[state.newsMode] = 0
    },
    refreshPolling: (state) => {
      if (!document.hidden) {
        for (const key in state.details) delete state.details[key]
        state.items = []
        state.errors = {}
        state.loadedItemsCounters[state.newsMode] = 0
        state.pollingCounter += 1
      } else
        state.mainRequestResult = {
          ok: false,
          message: 'Refresh procedure skiped'
        }
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
      if (state.newsMode === ENewsMode.FAV) {
        state.loadedItemsCounters[state.newsMode] += 1
        state.pollingCounter += 1
      }
    },
    removeFromPersistedFavorites: (state, action: PayloadAction<{ id: number; }>) => {
      state.persistedFavorites = state.persistedFavorites.filter((id) => id !== action.payload.id)
      if (state.newsMode === ENewsMode.FAV) {
        delete state.details[String(action.payload.id)]
        state.loadedItemsCounters[state.newsMode] -= 1
        state.pollingCounter += 1
      }
    },
    addMetaCache: (state, action: PayloadAction<{
      newsItemUrl: string;
      meta?: TMetaCacheSample;
    }>) => {
      try {
        const limitMB = 1
        if (jsonSize(state.metaCache) > limitMB * 1024 * 1024)
          state.metaCache = {}
      } catch (err) {
        console.warn('Cleanup local memory error!')
        console.warn(err)
      }

      const ts = new Date().getTime()
      state.metaCache[action.payload.newsItemUrl] = {
        ts,
        meta: action.payload.meta,
      }
      // state.localStorageUsageInfo = getLocalStorageSpace({
      //   theFieldNames: 
      //   getText: ({ bytes }) => `Total ${(bytes/1000).toFixed(2)} KB`
      // })
      try {
        state.lsUsageInfo.meta = `Meta data local size ${getHumanReadableSize({ bytes: jsonSize(state.metaCache), decimals: 2 })}`
      } catch (err) {
        console.warn('Local memory update error!')
        console.warn(err)
      }
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
  addMetaCache,
} = newsSlice.actions
