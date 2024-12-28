import { createFastContext } from '~/common/context/utils'
import { useMemo, useLayoutEffect } from 'react'
import { useSelector } from 'react-redux'
import { TStore } from '~/common/store'
import { documentTitleBadger } from '~/common/utils/documentTitleBadger'

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
  const deltaCouter = useMemo(() => loadedTagetCounter - items.length, [loadedTagetCounter, items.length])
  
  useLayoutEffect(() => {
    let newTitle
    switch (true) {
      case deltaCouter > 0:
        newTitle = `${BRAND_NAME} (+${deltaCouter})`
        documentTitleBadger.value = deltaCouter
        break
      default:
        newTitle = BRAND_NAME
        documentTitleBadger.value = 0
        break
    }
    document.title = newTitle
  }, [deltaCouter])

  return (
    <Provider>
      {children}
    </Provider>
  )
}
