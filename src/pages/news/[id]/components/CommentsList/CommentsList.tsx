import baseClasses from '~/App.module.scss'
import { Comment } from './components'
import { memo } from 'react'

type TProps = {
  items: number[];
}

export const CommentsList = memo(({ items }: TProps) => {
  if (items.length === 0) return null

  return (
    <div className={baseClasses.stack1}>
      {
        items.map((id) => {
          return (
            <Comment key={id} id={id} level={1} autoLoad />
          )
        })
      }
    </div>
  )
})
