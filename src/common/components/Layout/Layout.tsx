import { useMemo, memo } from 'react'
import classes from './Layout.module.scss'
import baseClasses from '~/App.module.scss'
import clsx from 'clsx'
import { FixedScrollTopBtn } from './components'

type TProps = {
  children: React.ReactNode;
}

export const Layout = memo(({ children }: TProps) => {
  const fullyear = useMemo(() => new Date().getFullYear(), [])

  return (
    <>
      <div className={clsx(classes.layoutWrapper, baseClasses.stack0)}>
        {children}
        <footer className={classes.siteFooter}>{fullyear}</footer>
      </div>
      <FixedScrollTopBtn />
    </>
  )
})
