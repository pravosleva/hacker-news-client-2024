import { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { TStore } from '~/common/store'
import { TNewsItemDetails } from '~/common/store/reducers/newsSlice'
import { ErrorFallback } from '~/common/components'
import { ErrorBoundary } from 'react-error-boundary'
import { BasicCard } from './components'
import { Alert, Skeleton } from '@mui/material'

type TProps = {
  newsItemId: number;
}

export const NewsListItem = memo(({ newsItemId }: TProps) => {
  const details = useSelector((s: TStore) => s.news.details)
  const itemData = useMemo<TNewsItemDetails | undefined>(() => details[String(newsItemId)], [details, newsItemId])

  const errors = useSelector((s: TStore) => s.news.errors)
  const itemErrorInfo = useMemo<string | undefined>(() => errors[String(newsItemId)], [errors, newsItemId])

  const MemozedNewsItem = useMemo(() => {
    switch (true) {
      case !!itemData:
        return (
          <BasicCard
            id={itemData?.id}
            title={itemData?.title}
            rating={itemData?.score}
            publishUnixTime={itemData?.time}
            author={itemData?.by}
            errorMessage={itemErrorInfo}
            localLink={`/news/${itemData.id}`}
          />
        )
      case !!itemData?.id && !!itemErrorInfo:
        return (
          <Alert
            variant='filled'
            severity='error'
          >
            {`#${newsItemId} ERRORED:`} {itemErrorInfo}
          </Alert>
        )
      default:
        return (
          <Skeleton animation='wave' />
        )
    }
  }, [itemData, itemErrorInfo, newsItemId])

  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          customPossibleReason='May be removed by moderator'
        />
      )}
    >
      {MemozedNewsItem}
    </ErrorBoundary>
  )
})
