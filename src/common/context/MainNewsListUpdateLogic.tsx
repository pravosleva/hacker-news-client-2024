import { createFastContext } from '~/common/context/utils'
import { useCallback, useLayoutEffect, useRef, useEffect, memo } from 'react'
import { httpClient } from '~/common/utils/httpClient/httpClient'
import { useWorkers } from '~/common/hooks'
import { useSelector, useDispatch } from 'react-redux'
import { TStore } from '~/common/store'
import { setNewsItemData, setMainRequestResult, setNewsItemError, ENewsMode, refreshPolling } from '~/common/store/reducers/newsSlice'
import { PollingComponent } from '~/common/components'
import { NResponse } from '~/common/utils/httpClient/types'
import { wws } from '~/common/utils/wws'

const { Provider, useStore } = createFastContext<{
  newsListRefreshDate: number | null;
}>({
  newsListRefreshDate: new Date().getTime() + (30 * 60 * 1000),
})

type TProps = {
  children: React.ReactNode;
}

const Logic = memo(({ children }: TProps) => {
  const dispatch = useDispatch()
  const handleEachResponse = useCallback(({ data }: {
    data: NResponse.TMinimalStandart<number[]>;
  }) => {
    dispatch(setMainRequestResult({ result: data }))
  }, [dispatch])
  const items = useSelector((s: TStore) => s.news.items)
  const newsMode = useSelector((s: TStore) => s.news.newsMode)
  const mainPollingKey = useSelector((s: TStore) => s.news.pollingCounter)

  // const [_newsListRefreshDate, setNewsListRefreshDate] = useStore((s) => s.newsListRefreshDate)
  const refreshListPollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (!!refreshListPollingIntervalRef.current) {
      clearInterval(refreshListPollingIntervalRef.current)
    }
    refreshListPollingIntervalRef.current = setInterval(() => {
      dispatch(refreshPolling())
    }, 2 * 60 * 60 * 1000)
    return () => {
      if (!!refreshListPollingIntervalRef.current) {
        clearInterval(refreshListPollingIntervalRef.current)
      }
    }
  }, [dispatch])

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
  const getNewsPromise = useCallback((): Promise<NResponse.TMinimalStandart<number[]>> => {
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
        promise={getNewsPromise}
        delay={60 * 1000}
        // isDebugEnabled
      />
    </Provider>
  )
})

export const MainNewsListUpdateLogic = ({ children }: TProps) => {
  return (
    <Provider>
      <Logic>
        {children}
      </Logic>
    </Provider>
  )
}

export { useStore }
