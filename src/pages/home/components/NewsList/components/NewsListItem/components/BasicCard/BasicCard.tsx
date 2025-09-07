import { useLayoutEffect, useMemo, useState, memo } from 'react'
import { Button, Card, Chip, CardContent, CardActions } from '@mui/material'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { getNormalizedDateTime } from '~/common/utils/time-ops'
import { useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import classes from './BasicCard.module.scss'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import baseClasses from '~/App.module.scss'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import {
  // useDispatch,
  useSelector,
} from 'react-redux'
import { TStore } from '~/common/store'
// import { PollingComponent } from '~/common/components'
// import { addMetaCache, TMetaCacheSample } from '~/common/store/reducers'
// import { httpClient, NResponse } from '~/common/utils/httpClient'

type TProps = {
  id: number;
  title: string;
  rating: number;
  publishUnixTime: number;
  author: string;
  errorMessage?: string;
  localLink: string;
  isNew?: boolean;
  // bgUrl?: string;
  externalUrl?: string;
}

export const BasicCard = memo(({
  id,
  title,
  rating,
  publishUnixTime,
  author,
  errorMessage,
  localLink,
  isNew,
  // bgUrl,
  // externalUrl,
}: TProps) => {
  // -- NOTE: 2/3 Совершенно необязательный механизм,
  // просто интуитивный UX
  // TODO: Можно перенести в отдельный контекст
  const [isLastSeen, setIsLastSeen] = useState(false)
  const [urlSearchParams] = useSearchParams()
  useLayoutEffect(() => {
    const idToScroll = urlSearchParams.get('lastSeen')
    setIsLastSeen(idToScroll === String(id))
  }, [urlSearchParams, id, setIsLastSeen])
  // --

  const favoritesIds = useSelector((s: TStore) => s.news.persistedFavorites)
  const isFavorite = useMemo(() => favoritesIds.includes(Number(id)), [favoritesIds, id])
  
  // const metaCache = useSelector((s: TStore) => s.news.metaCache)
  // const targetMeta = useMemo(() => !!externalUrl ? metaCache[externalUrl]?.meta : null, [externalUrl, metaCache])
  // const metaError = useMemo(() => !!externalUrl ? metaCache[externalUrl]?.error : null, [externalUrl, metaCache])
  
  // const getMetaPromise = useCallback(() => {
  //   return httpClient.getNewsItemMeta({ externalUrl: externalUrl || '' })
  // },
  // [externalUrl])

  // const dispatch = useDispatch()
  // const handleEachMetaResponse = useCallback(({ data, newsItemUrl }: {
  //   data: {
  //     success: 0|1;
  //     meta?: TMetaCacheSample;
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     error?: string | { [key: string]: any };
  //   };
  //   newsItemUrl: string;
  // }) => {
  //   try {
  //     switch (data.success) {
  //       case 1:
  //         // console.log(data)
  //         if (!!data?.meta) {
  //           dispatch(addMetaCache({ meta: data.meta, newsItemUrl }))
  //         }
  //         break
  //       case 0:
  //       default:
  //         // console.log(data)
  //         if (!!data?.error) {
  //           dispatch(addMetaCache({ error: data.error, newsItemUrl }))
  //         }
  //         break
  //     }
  //   } catch (err) {
  //     console.warn(err)
  //   }
  // }, [dispatch])

  return (
    <>
      <Card
        id={String(id)}
        sx={{
          boxShadow: 'none',
          border: '2px solid lightgray',
          borderRadius: '16px',
          
          position: 'relative',

          // backgroundImage: !!targetMeta?.image ? `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.9)), url(${targetMeta.image})` : 'none',
          // backgroundPosition: 'center',
          // backgroundRepeat: 'no-repeat',
          // backgroundSize: 'auto',
        }}
        className={clsx(
          classes.transition,
          {
            [classes.isRotated]: isLastSeen,
          },
        )}
      >
        <div style={{ backdropFilter: 'blur(2px)', padding: '8px', }}>
        <CardContent
          sx={{ padding: '8px' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <Typography gutterBottom sx={{ color: 'text.primary' }}>
              {title}
            </Typography>
            <b>{rating}</b>
          </div>
          <Typography gutterBottom variant="body2" sx={{ color: 'text.secondary' }}>
            by {author}
          </Typography>
          {
            !!errorMessage && (
              <Chip className={baseClasses.truncate} label={`Item Error: ${errorMessage}`} size='small' color='error' />
            )
          }
          {/*
            !!metaError && (
              <pre className={baseClasses.preNormalized}>
                {JSON.stringify(metaError, null, 2)}
              </pre>
            )
          */}
        </CardContent>
        <CardActions
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link to={localLink}>
            <Button
              variant='contained'
              endIcon={
                isFavorite
                ? <BookmarkIcon />
                : isNew
                  ? <NewReleasesIcon />
                  : <ArrowForwardIcon />}
              size='small'
              color={
                isLastSeen
                ? 'secondary'
                : 'primary'
              }
            >
              Read
            </Button>
          </Link>
          <small style={{ textAlign: 'right' }}>{getNormalizedDateTime(publishUnixTime)}</small>
        </CardActions>
        {/* <pre>{JSON.stringify(targetMeta, null, 2)}</pre> */}
        </div>
      </Card>
      {/*
        !!externalUrl && !targetMeta && !metaError && (
          <PollingComponent<{
            success: 0|1;
            meta: TMetaCacheSample;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error: string | {[key: string]: any};
          }>
            key={externalUrl}
            resValidator={(data) => data.targetResponse?.success === 1}
            // onEachResponse={(ps) => {}}
            onSuccess={(ps) => {
              if (!!ps.data.targetResponse) {
                handleEachMetaResponse({
                  newsItemUrl: externalUrl,
                  data: ps.data.targetResponse,
                })
              }
            }}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            promise={getMetaPromise}
            delay={60 * 1000}
            // isDebugEnabled
          />
        )
      */}
    </>
  );
})
