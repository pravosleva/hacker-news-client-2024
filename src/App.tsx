/* eslint-disable @typescript-eslint/no-unused-vars */
import CssBaseline from '@mui/material/CssBaseline'
import { RouterProvider } from 'react-router-dom'
import { memo, useCallback } from 'react'
import { httpClient } from '~/common/utils/httpClient/httpClient'
import { useWorkers } from '~/common/hooks'
import { useSelector, useDispatch } from 'react-redux'
import { TStore } from '~/common/store'
import { setNewsItemData, setMainRequestResult, setNewsItemError } from '~/common/store/reducers/newsSlice'
import { PollingComponent } from '~/common/components'
import { NResponse } from '~/common/utils/httpClient/types'
import { router } from './router'

export const App = memo(() => {
  // -- TODO: External logic
  const dispatch = useDispatch()
  const handleEachResponse = useCallback(({ data }: {
    data: NResponse.TMinimalStandart<number[]>;
  }) => dispatch(setMainRequestResult({ result: data })), [dispatch])

  const items = useSelector((s: TStore) => s.news.items)
  useWorkers({
    isDebugEnabled: false,
    cb: {
      onEachNewsItemData: (data) =>
        dispatch(setNewsItemData(data)),
      onFinalError: ({ id, reason }) =>
        dispatch(setNewsItemError({ id, reason })),
    },
    deps: {
      newsIds: items,
    },
  })
  // --

  const pollingKey = useSelector((s: TStore) => s.news.pollingCounter)

  return (
    <>
      <CssBaseline />
      <RouterProvider router={router} />
      <PollingComponent
        key={pollingKey}
        resValidator={(_data: NResponse.TMinimalStandart<number[]>) => false}
        onEachResponse={handleEachResponse}
        onSuccess={(_ps: { data: NResponse.TMinimalStandart<number[]> }) => {
          // NOTE: Never, cuz resValidator() => false
        }}
        promise={() => httpClient.getNews()}
        delay={60 * 1000}
        // isDebugEnabled
      />
    </>
  )
})
