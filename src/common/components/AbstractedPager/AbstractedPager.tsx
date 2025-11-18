/* eslint-disable react-hooks/rules-of-hooks */
import { memo, Fragment, useState, useCallback, useEffect, useMemo, useLayoutEffect, useRef } from 'react'
// import { getSplittedArray } from '~/common/utils/array-ops/split-array'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { Button } from '@mui/material'
import {
  getBinarySearchedIndexByDotNotation,
} from '~/common/utils/array-ops/search'
import { getSplittedArrayAsPager, TService } from '~/common/utils/array-ops/split-array'

const getNormalizedPage = (index: number): number => index + 1

type TProps<TItemFormat> = {
  items: TItemFormat[];
  pageLimit: number;
  itemRenderer: (ps: { item: TItemFormat; pager: TService<TItemFormat>; localItemIndex: number; currentPage: number }) => React.ReactNode;
  getItemKey: (ps: { item: TItemFormat }) => string;
  lastSeenId?: number;
  // target?: TItemFormat;
  hasTargetInPage: (item: TItemFormat, i: number, items: TItemFormat[]) => boolean;
  cbOnDetectTargetInPage?: () => void;
  autoSelectTargetPage?: boolean;
}

const genericMemo: <T>(component: T) => T = memo

function __AbstractedPager<TItemFormat>({
  items,
  pageLimit,
  itemRenderer,
  getItemKey,
  lastSeenId,
  // target,
  hasTargetInPage,
  cbOnDetectTargetInPage,
  autoSelectTargetPage,
}: TProps<TItemFormat>) {

  // const pager = useMemo(() => getSplittedArray({
  //   list: items,
  //   pageLimit,
  // }), [items, pageLimit])

  const [currentPage, setCurrentPage] = useState<number>(0)

  const targetJobIndex = useMemo(
    () => typeof lastSeenId === 'number'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? getBinarySearchedIndexByDotNotation<any, number>({
        items: items.map((e) => ({ id: e })),
        sorted: 'DESC',
        // ASC - от англ. ascending — восходящий
        // DESC - от англ. descending — нисходящий
        target: {
          value: lastSeenId,
          propPath: 'id',
        },
      })
      : -1,
    [items, lastSeenId]
  )

  const pager = useMemo(() => {
    return getSplittedArrayAsPager({
      pageLimit: 10,
      list: items,
      options: {
        // requiredPageIndex?: number | undefined;
        requiredCurrentIndex: targetJobIndex,
      },
    })
  }, [targetJobIndex, items])

  const handlePrev = () => {
    setCurrentPage((v) => v - 1 < 0 ? 0 : v - 1)
  }

  const handleNext = useCallback(() => {
    setCurrentPage((v) => v + 1 <= (pager.result?.pagination.totalPages || 1) - 1 ? v + 1 : v)
  }, [pager.result?.pagination.totalPages])

  const isCurrentLast = useMemo(
    () => currentPage === (
      typeof pager.result?.pagination.totalPages === 'number'
        ? pager.result?.pagination.totalPages - 1
        : 0
    ),
    [pager.result?.pagination.totalPages, currentPage]
  )
  const isCurrentFirst = currentPage === 0

  useEffect(() => {
    const hasTargetInCurrentList = !!pager.result?.pager[currentPage] && !!pager.result?.pager[currentPage].find(hasTargetInPage)
    if (hasTargetInCurrentList) {
      console.log('+===')
      if (typeof cbOnDetectTargetInPage === 'function')
        cbOnDetectTargetInPage()
      else window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      console.log('-===')
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [currentPage, pager.result?.pager, hasTargetInPage, cbOnDetectTargetInPage])

  // useEffect(() => console.log(`EFF: currentPage`), [currentPage])
  // useEffect(() => console.log(`EFF: pager`), [pager])
  // useEffect(() => console.log(`EFF: hasTargetInPage`), [hasTargetInPage])
  // useEffect(() => console.log(`EFF: cbOnDetectTargetInPage`), [cbOnDetectTargetInPage])

  const renderCounter = useRef(0)

  useLayoutEffect(() => {
    if (autoSelectTargetPage) {
      console.log(`-- targetJobIndex -> ${targetJobIndex}`)
      if (targetJobIndex !== -1 && renderCounter.current === 0) {
        // NOTE: Traget current page should be found and set
        const _pagerCalc = getSplittedArrayAsPager({
          pageLimit,
          list: items,
          options: {
            // NOTE: One of two options (requiredPage in main priority)
            // requiredPageIndex: eventData?.input?.requiredPage >= 1 ? eventData?.input?.requiredPage - 1 : undefined,
            requiredCurrentIndex: targetJobIndex === -1 ? 0 : targetJobIndex,
            // NOTE: First page will be taken by default
          },
        })
        if (_pagerCalc.result?.pagination.currentPageIndex) {
          setCurrentPage(_pagerCalc.result?.pagination.currentPageIndex)
          renderCounter.current += 1
        }
      }
    } else
      console.log('- NO')
  }, [autoSelectTargetPage, items, lastSeenId, setCurrentPage, pageLimit, targetJobIndex])

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: '8px',
          right: '8px',
          zIndex: 10,
          border: '1px dashed red'
        }}
      >
        <b>| {lastSeenId} | {currentPage} | {pager.result?.pagination.currentPage}</b>
      </div>
      {!!pager.result?.pager && !!pager.result?.pager[currentPage] && pager.result?.pager[currentPage].map((item, i) => (
        <Fragment key={getItemKey({ item })}>
          {itemRenderer({ item, pager, localItemIndex: i, currentPage })}
        </Fragment>
      ))}
      <div
        style={{
          width: 'calc(100% - 32px)',
          margin: '0 auto',
          position: 'sticky',
          bottom: '54px',
          zIndex: 2,
          border: '2px solid lightgray',
          padding: '16px',
          backgroundColor: '#FFF',
          borderRadius: '32px',
          // boxShadow: '0px 0px 8px 4px rgba(34,60,80,.2)',
          marginTop: '24px',

          display: 'grid',
          columnGap: '16px',
          rowGap: '16px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(50px, 1fr))',
          // grid-auto-rows: 1fr;
          // grid-template-rows: repeat(1fr);
          gridAutoFlow: 'dense',
        }}
      >
        <Button
          sx={{ borderRadius: 4 }}
          size='small'
          // variant='outlined'
          variant={isCurrentLast ? 'contained' : 'outlined'}
          fullWidth
          // startIcon={<ArrowBackIosIcon />}
          onClick={handlePrev}
          disabled={isCurrentFirst}
        >
          {/*`Prev${!outputWorkerData?.pagination.isCurrentPageFirst && typeof outputWorkerData?.pagination.currentPageIndex === 'number' ? ` (${getNormalizedPage(outputWorkerData?.pagination.currentPageIndex - 1)} of ${outputWorkerData?.pagination.total})` : ''}`*/}
          <ArrowBackIosIcon sx={{ fontSize: '14px' }} />
        </Button>

        {/* PAGES: CUR={currentPage} | NEXT={currentPage + 1} | PREV={currentPage - 1} */}

        <Button
          sx={{ borderRadius: 4 }}
          size='small'
          variant={!isCurrentLast ? 'contained' : 'outlined'}
          fullWidth
          // endIcon={<ArrowForwardIosIcon />}
          onClick={handleNext}
          disabled={isCurrentLast}
        >
          {/*`Next${!outputWorkerData?.pagination.isCurrentPageLast && typeof outputWorkerData?.pagination.currentPageIndex === 'number' ? ` (${getNormalizedPage(outputWorkerData?.pagination.currentPageIndex + 1)} of ${outputWorkerData?.pagination.total})` : ''}`*/}
          <ArrowForwardIosIcon sx={{ fontSize: '14px' }} />
        </Button>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            color: '#959eaa',
            fontWeight: 'bold',
          }}
        >
          {getNormalizedPage(currentPage)} / {pager.result?.pagination.totalPages}
        </div>
      </div>
    </>
  )
}

export const AbstractedPager = genericMemo(__AbstractedPager)
