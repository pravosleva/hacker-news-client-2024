import { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { TStore } from '~/common/store'
import baseClasses from '~/App.module.scss'
import { NewsListItem } from './components'
import { Alert } from '@mui/material'

export const NewsList = memo(() => {
  const items = useSelector((s: TStore) => s.news.items)

  // NOTE: Not good
  // if (mainResponseResult?.ok === false)
  //   throw new Error(mainResponseResult.message || 'Что-то пошло не так, но клиент будет в курсе, что именно, т.к. внешняя обертка покажет ошибку')
  
  const newsMode = useSelector((s: TStore) => s.news.newsMode)
  const loadedCounters = useSelector((s: TStore) => s.news.loadedItemsCounters)
  const loadedTagetCounter = useMemo(() => loadedCounters[newsMode], [loadedCounters, newsMode])
  const newSinceLastUpdateCounter = useMemo(() => loadedTagetCounter > items.length
    ? loadedTagetCounter - items.length
    : 0,
    [loadedTagetCounter, items.length])
  const MemoizedItems = useMemo(() => {
    // const isNew = newSinceLastUpdateCounter > 0 ? newSinceLastUpdateCounter > items.length - 1 : false
    return (
      items.length > 0
        ? items?.map((id, i) => (
          <NewsListItem
            key={String(id)}
            newsItemId={id}
            isNew={newSinceLastUpdateCounter > i}
          />
        )) : (
          <Alert
            variant='outlined'
            severity='info'
          >
            No items yet
          </Alert>
        )
    )
  }, [items, newSinceLastUpdateCounter])
  
  return (
    <div className={baseClasses.stack2}>
      {MemoizedItems}
    </div>
  )
})
