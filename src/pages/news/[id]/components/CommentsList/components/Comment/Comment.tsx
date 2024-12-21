/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-extra-boolean-cast */
import clsx from 'clsx'
import classes from './Comment.module.scss'
import { PollingComponent } from '~/common/components'
import { NResponse, httpClient } from '~/common/utils/httpClient'
import { TNewsItemDetails } from '~/common/store/reducers/newsSlice/types'
import { useSelector, useDispatch } from 'react-redux'
import { TStore } from '~/common/store'
import { memo, useCallback, useMemo, useState } from 'react'
import { setNewsItemData, setNewsItemError } from '~/common/store/reducers'
import baseClasses from '~/App.module.scss'
import { Alert, Box, Button, Skeleton } from '@mui/material'
import { getNormalizedDateTime } from '~/common/utils/time-ops'
import { compareDESC } from '~/common/utils/number-ops'
import { useParams } from 'react-router-dom'
import { scrollTop, scrollToElm } from '~/common/components/Layout/utils'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'

type TProps = {
  id: number;
  level: number;
  autoLoad?: boolean;
}

export const Comment = memo(({ id, level, autoLoad }: TProps) => {
  const dispatch = useDispatch()
  const itemData = useSelector((s: TStore) => !!id ? s.news.details[id] : undefined)

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
    else dispatch(setNewsItemError({ id, reason: data.message || 'No data.message' }))
  }, [dispatch, id])

  const [clicked, setClicked] = useState(false)
  const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setClicked(true)
  }, [setClicked])

  const params = useParams()
  const handleScrollToParent = useCallback((parentId: number) => (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    // -- NOTE: 3/3 Совершенно необязательный механизм,
    // просто удобный UX
    // TODO: Перенести в отдельный контекст
    if (!!parentId) {
      const targetElm = document.getElementById(String(parentId))
      if (!!targetElm) {
        switch (true) {
          case parentId === Number(params.id):
            scrollTop()
            break
          default:
            targetElm.scrollIntoView({ behavior: 'smooth', block: 'center' })
            scrollToElm(targetElm)
            break
        }
      } else {
        console.error('No elm')
      }
    }
    // --
  }, [params])

  return (
    <>
      <div
        className={clsx(classes[`level${level}`], classes.wrapper, baseClasses.stack1)}
        onClick={handleClick}
        id={String(id)}
      >
        {
          !itemData
          ? <Skeleton animation='wave' />
          : (
            <>
              {
                !!itemData?.id && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {
                      !!itemData?.by
                        ? <b>#{id} by {itemData?.by}</b>
                        : <b>#{id}</b>
                    }
                    {!!itemData?.parent && (
                      <Button
                        variant='text'
                        endIcon={<ArrowUpwardIcon />}
                        size='small'
                        onClick={handleScrollToParent(itemData.parent)}
                      >
                        To Parent
                      </Button>
                    )}
                  </div>
                )
              }

              {
                itemData?.deleted && (
                  <>
                    <Alert
                      variant='filled'
                      severity='warning'
                    >
                      #{id} DELETED
                    </Alert>
                    <pre className={baseClasses.preNormalized}>
                      {JSON.stringify(itemData, null, 2)}
                    </pre>
                  </>
                )
              }
              {
                !!itemErrorInfo && (
                  <Alert
                    variant='filled'
                    severity='error'
                  >
                    #{id} ERRORED: {itemErrorInfo}
                  </Alert>
                )
              }
              
              {
                !!itemData?.url && (
                  <a href={itemData.url} target='_blank'>
                    {itemData.url}
                  </a>
                )
              }
              {
                !!itemData?.text && (
                  <div dangerouslySetInnerHTML={{ __html: itemData?.text }} />
                )
              }
              {!!itemData?.time && <Box sx={{ color: 'text.secondary', fontSize: 'small', textAlign: 'right' }}>{getNormalizedDateTime(itemData?.time)}</Box>}
              {!!itemData?.kids && <div className={classes.commentslabel}>{itemData.kids.length} {itemData.kids.length > 1 ? 'comments' : 'comment'}</div>}
            </>
          )
        }
        {
          (autoLoad || clicked) && (
            <PollingComponent
              resValidator={(_data: NResponse.TMinimalStandart<TNewsItemDetails>) => false}
              onEachResponse={handleEachResponse}
              onSuccess={(_ps: { data: NResponse.TMinimalStandart<TNewsItemDetails> }) => {
                // NOTE: Never, cuz resValidator() => false
              }}
              promise={() => httpClient.getNewsItem({ id })}
              delay={60 * 1000}
              // isDebugEnabled
              // renderer={({ isWorking }) => {
              //   return (
              //     isWorking
              //     ? (
              //       <div style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '8px' }}>
              //         poll...
              //       </div>
              //     ) : null
              //   )
              // }}
            />
          )
        }
      </div>
      {
        clicked && !!itemData?.kids && itemData?.kids?.length > 0 && (
          itemData?.kids?.map((e) => Number(e)).sort(compareDESC).map((kid) => {
            return <Comment key={kid} id={kid} level={!!level ? level + 1 : 2} autoLoad />
          })
        )
      }
    </>
  )
})
