import { createFastContext } from '~/common/context/utils'
import { useMemo, useLayoutEffect } from 'react'
import { useSelector } from 'react-redux'
import { TStore } from '~/common/store'

const BRAND_NAME = import.meta.env.VITE_BRAND_NAME
const { Provider } = createFastContext({ _unusedProp: 0 })

type TProps = {
  children: React.ReactNode;
}

export const DocumentTitleUpdateLogic = ({ children }: TProps) => {
  const items = useSelector((s: TStore) => s.news.items)
  const newsMode = useSelector((s: TStore) => s.news.newsMode)
  const loadedCounters = useSelector((s: TStore) => s.news.loadedItemsCounters)
  const loadedTagetCounter = useMemo(() => loadedCounters[newsMode], [loadedCounters, newsMode])

  useLayoutEffect(() => {
    let newTitle
    if (loadedTagetCounter > items.length)
      newTitle = `${BRAND_NAME} (+${loadedTagetCounter - items.length})`
    else newTitle = BRAND_NAME

    document.title = newTitle
  }, [loadedTagetCounter, items.length])

  return (
    <Provider>
      {children}
    </Provider>
  )
}
