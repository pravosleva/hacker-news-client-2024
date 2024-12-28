import { createFastContext } from '~/common/context/utils'
import { useCallback, useLayoutEffect } from 'react'
import { httpClient } from '~/common/utils/httpClient/httpClient'
import { useWorkers } from '~/common/hooks'
import { useSelector, useDispatch } from 'react-redux'
import { TStore } from '~/common/store'
import { setNewsItemData, setMainRequestResult, setNewsItemError, ENewsMode } from '~/common/store/reducers/newsSlice'
import { PollingComponent } from '~/common/components'
import { NResponse } from '~/common/utils/httpClient/types'
import { wws } from '~/common/utils/wws'

const { Provider } = createFastContext({ _unusedProp: 0 })

type TProps = {
  children: React.ReactNode;
}

export const MainNewsListUpdateLogic = ({ children }: TProps) => {
  const dispatch = useDispatch()
  const handleEachResponse = useCallback(({ data }: {
    data: NResponse.TMinimalStandart<number[]>;
  }) => {
    dispatch(setMainRequestResult({ result: data }))
  }, [dispatch])
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
      onEachNewsItemData: (data) => dispatch(setNewsItemData(data)),
      onFinalError: ({ id, reason }) => dispatch(setNewsItemError({ id, reason })),
    },
    deps: {
      newsIds: items,
      mainPollingKey,
    },
  })
  const persistedFavorites = useSelector((s: TStore) => s.news.persistedFavorites)
  const targetPromise = useCallback((): Promise<NResponse.TMinimalStandart<number[]>> => {
    switch (newsMode) {
      case ENewsMode.FAV:
        return Promise.resolve({
          ok: true,
          message: 'Should be taken from LS',
          targetResponse: persistedFavorites,
        })
      default:
        return httpClient.getNews({ newsMode })
    }
  },
  [newsMode, persistedFavorites])

  return (
    <Provider>
      {children}
      <PollingComponent<number[]>
        key={mainPollingKey}
        resValidator={(_data) => false}
        onEachResponse={handleEachResponse}
        onSuccess={(_ps) => {
          // NOTE: Never, cuz resValidator() => false
        }}
        promise={targetPromise}
        delay={60 * 1000}
        // isDebugEnabled
      />
    </Provider>
  )
}
