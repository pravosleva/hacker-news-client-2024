/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { PollingComponent, WebShare } from '~/common/components'
import { NResponse, httpClient } from '~/common/utils/httpClient'
import { setNewsItemData, setNewsItemError, TNewsItemDetails, resetNewsItemData, addToPersistedFavorites, removeFromPersistedFavorites, TMetaCacheSample } from '~/common/store/reducers'
import { CommentsList } from './components'
import { compareDESC } from '~/common/utils/number-ops'
import RefreshIcon from '@mui/icons-material/Refresh'
import { getNormalizedDateTime } from '~/common/utils/time-ops'
import { Layout } from '~/common/components'
import classes from './NewsItemPage.module.scss'
import clsx from 'clsx'
import layoutClasses from '~/common/components/Layout/Layout.module.scss'
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove'
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd'
import { addMetaCache } from '~/common/store/reducers'
import CircularProgress from '@mui/material/CircularProgress'

const PUBLIC_URL = `https://pravosleva.pro${import.meta.env.VITE_PUBLIC_URL || ''}`

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

  const getMetaPromise = useCallback(() => {
    return httpClient.getNewsItemMeta({ externalUrl: itemData?.url || '' })
  },
  [itemData?.url])
  const metaCache = useSelector((s: TStore) => s.news.metaCache)
  const targetMeta = useMemo(() => !!itemData?.url ? metaCache[itemData.url]?.meta : null, [itemData?.url, metaCache])
  
  const [metaErr, setMetaErr] = useState<any>(null)
  const handleSetErr = useCallback((ps: any) => {
    if (ps?.success !== 1) setMetaErr(ps)
  }, [])

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
          (!!targetMeta?.image && !!targetMeta?.url)
          ? (
            <div
              className={classes.wrapperBg}
              style={{
                backgroundImage: `url("${targetMeta.image}")`,
                borderRadius: '16px',
              }}
            >
              <a
                className={classes.content}
                target='_blank'
                href={targetMeta.url}
                style={{
                  width: '100%',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  textDecoration: 'none',
                }}
              >
                <span
                  style={{ fontWeight: 'bold', textDecoration: 'underline', }}
                  className={classes.title}
                >{targetMeta.title || targetMeta.url}</span>
                {!!targetMeta.description && (
                  <span
                    className={classes.descr}
                    style={{ textDecoration: 'none' }}
                  >{targetMeta.description}</span>
                )}
              </a>
            </div>
          )
          : !!itemData?.url && !targetMeta && !metaErr
            ? (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </div>
            )
            : !!itemData?.url && (
              <a
                href={itemData?.url}
                target='_blank'
              >{itemData?.url}</a>
            )
        }

        {
          !!metaErr && (
            <div className={baseClasses.stack0}>
              <div
                style={{
                  borderRadius: '8px 8px 0px 0px',
                  borderBottom: '1px solid lightgray',
                  padding: '8px',
                  backgroundColor: 'hsla(0, 0%, 0%, 0.04)',
                  fontWeight: 'bold',
                }}
              >Meta data errored</div>
              <pre
                className={baseClasses.preNormalized}
                style={{
                  borderTopLeftRadius: '0px',
                  borderTopRightRadius: '0px',
                }}
              >
                {JSON.stringify(metaErr, null, 2)}
              </pre>
            </div>
          )
        }

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

        <PollingComponent<TNewsItemDetails>
          key={pollingCounter}
          resValidator={(_data) => false}
          onEachResponse={handleEachResponse}
          onSuccess={(_ps: { data: NResponse.TMinimalStandart<TNewsItemDetails> }) => {
            // NOTE: Never, cuz resValidator() => false
          }}
          promise={() => httpClient.getNewsItem({ id: Number(id) })}
          delay={60 * 1000}
          // isDebugEnabled
        />

        {
          !!itemData?.url && !targetMeta && (
            <PollingComponent<{
              success: 0|1;
              meta: TMetaCacheSample;
               
              error: string | {[key: string]: any};
            }>
              key={itemData.url}
              resValidator={(data) => data.targetResponse?.success === 1}
              onEachResponse={({ data }) => {
                handleSetErr(data)
              }}
              onSuccess={({ data }) => {
                // console.info(data)
                if (
                  data.targetResponse?.success === 1
                  && !!data.targetResponse?.meta
                ) {
                  dispatch(addMetaCache({ meta: data.targetResponse.meta, newsItemUrl: itemData.url }))
                }
              }}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              promise={getMetaPromise}
              delay={10 * 60 * 1000}
              // isDebugEnabled
            />
          )
        }
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
              color={!!itemErrorInfo ? 'error' : 'primary'}
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
              color='error'
            >
              Unfav
            </Button>
          ) : (
            <Button
              variant='contained'
              startIcon={<BookmarkAddIcon />}
              size='small'
              onClick={addToFavorites({ id: Number(id) })}
            >
              Fav
            </Button>
          )
        }
        {
          !!itemData?.title && (
            <WebShare
              // url={itemData.url || `${PUBLIC_URL}/#/news/${id}`}
              url={`${PUBLIC_URL}/#/news/${id}`}
              title={itemData.title}
              text={clsx('Hacker News', '|', itemData.by && `by ${itemData.by} 👉`, itemData.title)}
            />
          )
        }
      </div>
    </Layout>
  )
})
