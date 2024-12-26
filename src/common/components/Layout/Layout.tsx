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
  const fullyear = useMemo(() => new Date().getFullYear(), [])

  return (
    <>
      <div className={clsx(classes.layoutWrapper, baseClasses.stack0)}>
        {children}
        <footer className={classes.siteFooter}>
          <div>{fullyear}</div>
          <div>v{APP_VERSION}</div>
          <div>GIT SHA1: {GIT_SHA1}</div>
        </footer>
      </div>
      <FixedScrollTopBtn />
    </>
  )
})
