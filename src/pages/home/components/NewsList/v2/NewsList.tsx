import { memo, useCallback, useLayoutEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { TStore } from '~/common/store'
import { AbstractedPager } from '~/common/components'
// import { TNewsItemDetails } from '~/common/store/reducers/newsSlice'
import { NewsListItem } from '~/pages/home/components/NewsList/components/NewsListItem'
// import { getBinarySearchedIndexByDotNotation } from '~/common/utils/array-ops/search'
import { useSearchParams } from 'react-router-dom'

export const NewsList = memo(() => {
  const newsMode = useSelector((s: TStore) => s.news.newsMode)
  const loadedCounters = useSelector((s: TStore) => s.news.loadedItemsCounters)
  const loadedTagetCounter = useMemo(() => loadedCounters[newsMode], [loadedCounters, newsMode])
  const items = useSelector((s: TStore) => s.news.items)
  const newSinceLastUpdateCounter = useMemo(() => loadedTagetCounter > items.length
    ? loadedTagetCounter - items.length
    : 0,
    [loadedTagetCounter, items.length])

  // -- NOTE: x/3 Совершенно необязательный механизм,
  // просто интуитивный UX
  // TODO: Можно перенести в отдельный контекст
  const [lastSeenId, setLastSeenId] = useState<number | undefined>(undefined)
  const [urlSearchParams] = useSearchParams()
  useLayoutEffect(() => {
    const idToScroll = urlSearchParams.get('lastSeen')
    const isNumeric = !Number.isNaN(Number(idToScroll))
    if (isNumeric) setLastSeenId(Number(idToScroll))
  }, [urlSearchParams])
  const handleScrollToTarget = useCallback(() => {
    if (!!lastSeenId) {
      const targetElm = document.getElementById(String(lastSeenId))
      if (!!targetElm) targetElm.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [lastSeenId])
  // --

  // const targetJobIndex = typeof lastSeenId === 'number'
  //   ? getBinarySearchedIndexByDotNotation<number, number>({
  //     items,
  //     sorted: 'DESC',
  //     target: {
  //       value: lastSeenId,
  //       propPath: 'id',
  //     },
  //   })
  //   : -1

  const hasTargetInPageFilter = useCallback((e: number, _i: number, _a: number[]) => e === lastSeenId, [lastSeenId])
  const getItemKey = useCallback(({ item }: { item: number }) => String(item), [])
  return (
    <>

      <AbstractedPager<number>
        pageLimit={10}
        items={items}
        itemRenderer={({ item, localItemIndex, pager, currentPage }) => (
          <NewsListItem
            newsItemId={item}
            isNew={
              !!pager.result
                ? newSinceLastUpdateCounter > (
                  (currentPage * 10) + localItemIndex
                )
                : false
            }
          />
        )}
        getItemKey={getItemKey}
        // target={targetJobIndex}
        lastSeenId={lastSeenId}
        hasTargetInPage={hasTargetInPageFilter}
        cbOnDetectTargetInPage={handleScrollToTarget}
        autoSelectTargetPage
      />
      {/* <div
        style={{
          position: 'fixed',
          bottom: '8px',
          right: '8px',
          zIndex: 10,
          border: '1px solid red'
        }}
      >
        <b>| {lastSeenId} |</b>
      </div> */}
    </>
  )
})
