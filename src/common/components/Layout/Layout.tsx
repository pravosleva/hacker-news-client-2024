import { useMemo, memo } from 'react'
import classes from './Layout.module.scss'
import baseClasses from '~/App.module.scss'
import clsx from 'clsx'
import { useSelector } from 'react-redux'
import { FixedScrollTopBtn } from './components'
import layoutClasses from './Layout.module.scss'
import { TStore } from '~/common/store'

const APP_VERSION = import.meta.env.VITE_APP_VERSION
const GIT_SHA1 = import.meta.env.VITE_GIT_SHA1
const GIT_BRANCH_NAME = import.meta.env.VITE_GIT_BRANCH_NAME

type TProps = {
  children: React.ReactNode;
}

export const Layout = memo(({ children }: TProps) => {
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const createdYear = 2024
  const isCreactedCurrentYear = useMemo(() => currentYear === createdYear, [createdYear, currentYear])
  const metaInLSText = useSelector((s: TStore) => s.news.lsUsageInfo.meta)

  return (
    <>
      <div className={clsx(classes.layoutWrapper, baseClasses.stack0)}>
        {children}
        <footer className={classes.siteFooter}>
          <div>App version <code className={layoutClasses.code}>{APP_VERSION}</code></div>
          <div>GIT SHA-1: <code className={layoutClasses.code}>{GIT_SHA1}</code></div>
          <div>GIT branch name: <code className={layoutClasses.code}>{GIT_BRANCH_NAME}</code></div>
          <div>©</div>
          <div>{isCreactedCurrentYear ? currentYear : `${createdYear} — ${currentYear}`}</div>
          {!!metaInLSText && <div>{metaInLSText}</div>}
        </footer>
      </div>
      <FixedScrollTopBtn />
    </>
  )
})
