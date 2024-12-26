import { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { TStore } from '~/common/store'
import baseClasses from '~/App.module.scss'
import { NewsListItem } from './components'
import { Alert } from '@mui/material'

export const NewsList = memo(() => {
  const items = useSelector((s: TStore) => s.news.items)
  const mainResponseResult = useSelector((s: TStore) => s.news.mainRequestResult)

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

  return (
    <div className={baseClasses.stack2}>
      {
        mainResponseResult?.ok === false && !!mainResponseResult.message && (
          <Alert
            variant='outlined'
            severity='error'
          >
            {`List Error: ${mainResponseResult.message}`}
          </Alert>
        )
      }
      {
        items?.map((id, i) => <NewsListItem key={String(id)} newsItemId={id} isNew={newSinceLastUpdateCounter > 0 ? newSinceLastUpdateCounter > i : false} />)
      }
    </div>
  )
})
