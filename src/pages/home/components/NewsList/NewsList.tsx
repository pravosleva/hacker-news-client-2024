import { memo } from 'react'
import { useSelector } from 'react-redux'
import { TStore } from '~/common/store'
import baseClasses from '~/App.module.scss'
import { NewsListItem } from './components'

export const NewsList = memo(() => {
  const items = useSelector((s: TStore) => s.news.items)
  const mainResponseResult = useSelector((s: TStore) => s.news.mainRequestResult)

  if (mainResponseResult?.ok === false)
    throw new Error(mainResponseResult.message || 'Что-то пошло не так, но клиент будет в курсе, что именно...')
  
  return (
    <div className={baseClasses.stack2}>
      {
        items?.map((id) => {
          return (
            <NewsListItem key={id} newsItemId={id} />
          )
        })
      }
    </div>
  )
})
