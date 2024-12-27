import { useMemo, memo } from 'react'
import classes from './Layout.module.scss'
import baseClasses from '~/App.module.scss'
import clsx from 'clsx'
import { FixedScrollTopBtn } from './components'

const APP_VERSION = import.meta.env.VITE_APP_VERSION
const GIT_SHA1 = import.meta.env.VITE_GIT_SHA1

type TProps = {
  children: React.ReactNode;
}

export const Layout = memo(({ children }: TProps) => {
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const createdYear = 2024
  const isCreactedCurrentYear = useMemo(() => currentYear === createdYear, [createdYear, currentYear])

  return (
    <>
      <div className={clsx(classes.layoutWrapper, baseClasses.stack0)}>
        {children}
        <footer className={classes.siteFooter}>
          <div>{isCreactedCurrentYear ? currentYear : `${createdYear} — ${currentYear}`}</div>
          <div>version {APP_VERSION}</div>
          <div>GIT SHA1: {GIT_SHA1}</div>
        </footer>
      </div>
      <FixedScrollTopBtn />
    </>
  )
})
