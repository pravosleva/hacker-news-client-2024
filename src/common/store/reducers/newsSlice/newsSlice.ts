import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TNewsState, TNewsItemDetails } from './types'
import { NResponse } from '~/common/utils/httpClient/types'
import { NWService } from '~/common/utils/wws/types';
import { compareDESC } from '~/common/utils/number-ops'

// Define the initial state for the slice
const initialState: TNewsState = {
  items: [],
  details: {},
  mainRequestResult: undefined,
  pollingCounter: 0,
  errors: {},
};

// Create the slice
const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNewsItemData: (state, action: PayloadAction<NWService.TNewsItemDataResult<TNewsItemDetails>>) => {
      switch (true) {
        case !!action.payload.originalResponse?.id:
          state.details[String(action.payload.originalResponse?.id)] = action.payload.originalResponse
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
        const sortedIds = action.payload.result.targetResponse.sort(compareDESC)
        const last100 = []
        for (let i = 0, max = 100; i < max; i++) last100.push(sortedIds[i])
        
        state.items = last100
      }
    },
    resetMainRequestResult: (state) => {
      state.mainRequestResult = undefined
    },
    refreshPolling: (state) => {
      for (const key in state.details) delete state.details[key]
      state.items = []
      state.errors = {}
      state.pollingCounter += 1
    },
    resetNewsItemData: (state, action: PayloadAction<{ id: number; }>) => {
      delete state.details[String(action.payload.id)]
      delete state.errors[String(action.payload.id)]
    },
  },
});

// Extract the reducer function from the slice
export const newsReducer = newsSlice.reducer

// Extract action creators from the slice
export const { setMainRequestResult, setNewsItemData, refreshPolling, setNewsItemError, resetMainRequestResult, resetNewsItemData } = newsSlice.actions
