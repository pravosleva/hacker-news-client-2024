/* eslint-disable @typescript-eslint/no-unused-vars */
import CssBaseline from '@mui/material/CssBaseline'
import { RouterProvider } from 'react-router-dom'
import { memo, useCallback, useLayoutEffect } from 'react'
import { httpClient } from '~/common/utils/httpClient/httpClient'
import { useWorkers } from '~/common/hooks'
import { useSelector, useDispatch } from 'react-redux'
import { TStore } from '~/common/store'
import { setNewsItemData, setMainRequestResult, setNewsItemError } from '~/common/store/reducers/newsSlice'
import { PollingComponent } from '~/common/components'
import { NResponse } from '~/common/utils/httpClient/types'
import { router } from './router'
import { wws } from './common/utils/wws'

export const App = memo(() => {
  // -- TODO: External logic
  const dispatch = useDispatch()
  const handleEachResponse = useCallback(({ data }: {
    data: NResponse.TMinimalStandart<number[]>;
  }) => dispatch(setMainRequestResult({ result: data })), [dispatch])

  const items = useSelector((s: TStore) => s.news.items)
  const newsMode = useSelector((s: TStore) => s.news.newsMode)
  const mainPollingKey = useSelector((s: TStore) => s.news.pollingCounter)
  // NOTE: For unwelcome events ignore
  useLayoutEffect(() => {
    wws.setActiveIncomingChannels({ wName: 'newsWorker', value: mainPollingKey })
  }, [mainPollingKey])
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
      mainPollingKey,
    },
  })
  const targetPromise = useCallback(() => httpClient.getNews({ newsMode }), [newsMode])
  // --

  return (
    <>
      <CssBaseline />
      <RouterProvider router={router} />
      <PollingComponent
        key={mainPollingKey}
        resValidator={(_data: NResponse.TMinimalStandart<number[]>) => false}
        onEachResponse={handleEachResponse}
        onSuccess={(_ps: { data: NResponse.TMinimalStandart<number[]> }) => {
          // NOTE: Never, cuz resValidator() => false
        }}
        promise={targetPromise}
        delay={60 * 1000}
        // isDebugEnabled
      />
    </>
  )
})
