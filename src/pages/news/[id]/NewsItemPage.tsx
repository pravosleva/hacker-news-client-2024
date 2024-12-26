/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-extra-boolean-cast */
import { memo, useMemo, useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { TStore } from '~/common/store'
import baseClasses from '~/App.module.scss'
import layoutStyles from '~/common/components/Layout/Layout.module.scss'
import { Box, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Alert, Skeleton } from '@mui/material'
import { PollingComponent } from '~/common/components'
import { NResponse, httpClient } from '~/common/utils/httpClient'
import { setNewsItemData, setNewsItemError, TNewsItemDetails, resetNewsItemData, addToPersistedFavorites, removeFromPersistedFavorites } from '~/common/store/reducers'
import { CommentsList } from './components'
import { compareDESC } from '~/common/utils/number-ops'
import RefreshIcon from '@mui/icons-material/Refresh'
import { getNormalizedDateTime } from '~/common/utils/time-ops'
import { Layout } from '~/common/components'
import classes from './NewsItemPage.module.scss'
import clsx from 'clsx'
import layoutClasses from '~/common/components/Layout/Layout.module.scss'
// import SaveIcon from '@mui/icons-material/Save'
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd'

export const NewsItemPage = memo(() => {
  const { id } = useParams()
  const itemData = useSelector((s: TStore) => !!id ? s.news.details[id] : undefined)
  const dispatch = useDispatch()

  const errors = useSelector((s: TStore) => s.news.errors)
  const itemErrorInfo = useMemo<string | undefined>(() => !!id ? errors[id] : undefined, [id, errors])

  const handleEachResponse = useCallback(({ data }: {
    data: NResponse.TMinimalStandart<TNewsItemDetails>;
  }) => {
    if (data.ok)
      dispatch(setNewsItemData({
        originalResponse: data.targetResponse,
        ...data,
      }))
    else dispatch(setNewsItemError({ id: Number(id), reason: data.message || 'No data.message' }))
  }, [dispatch, id])

  const comments = useMemo(() => {
    const sorted = Array.isArray(itemData?.kids)
      && itemData?.kids.length > 0
      ? itemData?.kids?.map((e) => Number(e)).sort(compareDESC)
      : []
    return sorted
  }, [itemData?.kids])

  const [pollingCounter, setPollingCounter] = useState(0)
  const handleClickUpdateComments = useCallback(() => {
    if (typeof id === 'string' && !!id) {
      dispatch(resetNewsItemData({ id: Number(id) }))
      setPollingCounter((c) => c + 1)
    }
  }, [dispatch, id, setPollingCounter])

  const favoritesIds = useSelector((s: TStore) => s.news.persistedFavorites)
  const addToFavorites = useCallback(({ id }: {
    id: number;
  }) => () => typeof id === 'number'
    ? dispatch(addToPersistedFavorites({ id: Number(id) }))
    : undefined,
    [dispatch]
  )
  const isFavorite = useMemo(() => favoritesIds.includes(Number(id)), [favoritesIds, id])
  const removeFromFavorites = useCallback(({ id }: {
    id: number;
  }) => () => typeof id === 'number'
    ? dispatch(removeFromPersistedFavorites({ id }))
    : undefined,
    [dispatch]
  )

  return (
    <Layout>
      <div
        className={layoutStyles.stickyTop}
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <b>#{id || '[No id]'}</b>
        </div>

      </div>
      <div
        className={clsx(baseClasses.stack3, classes.article)}
        // style={{
        //   paddingTop: '30px',
        // }}
        id={String(itemData?.id || 'unknown-id')}
      >
        {
          !itemData && <Skeleton animation='wave' />
        }
        {
          !!itemErrorInfo && (
            <div className={baseClasses.stack1}>
              <Alert
                variant='filled'
                severity='error'
              >
                {itemErrorInfo}
              </Alert>
              {
                !!itemData && (
                  <pre className={baseClasses.preNormalized}>
                    {JSON.stringify(itemData, null, 2)}
                  </pre>
                )
              }
            </div>
          )
        }
        {
          !!itemData?.by && (
            <Typography variant="h4" component="h1">
              by {itemData?.by}
            </Typography>
          )
        }
        {
          !!itemData?.title && (
            <Typography
              variant='body1'
              component="p"
              dangerouslySetInnerHTML={{ __html: itemData.title }}
            />
          )
        }
        {
          !!itemData?.text && (
            <Typography
              variant='body1'
              component="p"
              className={baseClasses.preNormalized}
              dangerouslySetInnerHTML={{ __html: itemData.text }}
            />
          )
        }
        {
          !!itemData?.url && (
            <a
              href={itemData?.url}
              target='_blank'
            >{itemData?.url}</a>
          )
        }
        {/*
          !!itemData && (
            <pre className={baseClasses.preNormalized}>
              {JSON.stringify(itemData, null, 2)}
            </pre>
          )
        */}

        {
          !!itemData && (
            <>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <Box sx={{ fontSize: 'small' }}>
                  {
                    comments.length > 0
                    ? `${comments.length} ${comments.length > 1 ? 'comments' : 'comment'}`
                    : 'No comments'
                  }
                </Box>
                {!!itemData?.time && <Box sx={{ color: 'text.secondary', fontSize: 'small', textAlign: 'right' }}>{getNormalizedDateTime(itemData?.time)}</Box>}
              </div>
              <CommentsList items={comments} />
            </>
          )
        }

        <PollingComponent
          key={pollingCounter}
          resValidator={(_data: NResponse.TMinimalStandart<TNewsItemDetails>) => false}
          onEachResponse={handleEachResponse}
          onSuccess={(_ps: { data: NResponse.TMinimalStandart<TNewsItemDetails> }) => {
            // NOTE: Never, cuz resValidator() => false
          }}
          promise={() => httpClient.getNewsItem({ id: Number(id) })}
          delay={60 * 1000}
          // isDebugEnabled
        />
      </div>

      <div
        className={layoutClasses.stickyBottom}
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <Link to={`/?lastSeen=${id}`}>
          <Button
            variant='outlined'
            startIcon={<ArrowBackIcon />}
            size='small'
          >
            Home
          </Button>
        </Link>
        {
          typeof id === 'string' && !!id && (
            <Button
              variant='outlined'
              onClick={handleClickUpdateComments}
              size='small'
            >
              <RefreshIcon />
            </Button>
          )
        }

        {
          isFavorite
          ? (
            <Button
              variant='outlined'
              size='small'
              startIcon={<BookmarkRemoveIcon />}
              onClick={removeFromFavorites({ id: Number(id) })}
            >
              Unfav
            </Button>
          ) : (
            <Button
              variant='outlined'
              startIcon={<BookmarkAddIcon />}
              size='small'
              onClick={addToFavorites({ id: Number(id) })}
            >
              Fav
            </Button>
          )
        }
      </div>
    </Layout>
  )
})
