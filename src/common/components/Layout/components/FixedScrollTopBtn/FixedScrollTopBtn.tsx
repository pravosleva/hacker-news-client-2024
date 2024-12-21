/* eslint-disable no-extra-boolean-cast */
import { useRef, useCallback, memo, useLayoutEffect } from 'react'
import { useScrollPosition, IWindowDims } from '~/common/hooks/useScrollPosition'
import clsx from 'clsx'
import classes from './FixedScrollTopBtn.module.scss'
import { scrollTop, scrollTopExtra } from '~/common/components/Layout/utils'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { useLocation, useSearchParams } from 'react-router-dom'

export const FixedScrollTopBtn = memo(() => {
  const [, isMoreThan2Screens]: [IWindowDims, boolean] = useScrollPosition()
  const ref = useRef<HTMLDivElement>(null)
  const handleClick = useCallback(() => {
    scrollTop()
  }, [])

  const location = useLocation()
  useLayoutEffect(() => {
    scrollTopExtra()
  }, [location])
  
  // -- NOTE: 1/2 Совершенно необязательный механизм,
  // просто удобный UX
  // TODO: Перенести в отдельный контекст
  const [urlSearchParams] = useSearchParams()
  useLayoutEffect(() => {
    const idToScroll = urlSearchParams.get('lastSeen')
    if (!!idToScroll) {
      const targetElm = document.getElementById(idToScroll)
      if (!!targetElm) targetElm.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [location, urlSearchParams])
  // --

  return (
    <>
      {typeof window !== 'undefined' && (
        <div
          ref={ref}
          onClick={handleClick}
          className={clsx(classes.wrapper, classes.fixed, { [classes.isRequired]: isMoreThan2Screens })}
        >
          <KeyboardArrowUpIcon color='primary' />
        </div>
      )}
    </>
  )
})
