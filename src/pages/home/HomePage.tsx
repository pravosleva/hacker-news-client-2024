import Button from '@mui/material/Button'
import { memo, useCallback } from 'react'
import { NewsList } from './components'
import { ErrorFallback } from '~/common/components'
import { ErrorBoundary } from 'react-error-boundary'
import { useDispatch } from 'react-redux'
import { refreshPolling, resetMainRequestResult } from '~/common/store/reducers'
import baseClasses from '~/App.module.scss'
import layoutStyles from '~/common/components/Layout/Layout.module.scss'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Layout } from '~/common/components'
import layoutClasses from '~/common/components/Layout/Layout.module.scss'
import GitHubIcon from '@mui/icons-material/GitHub'
import { Link } from 'react-router-dom'

const BRAND_NAME = import.meta.env.VITE_BRAND_NAME

export const HomePage = memo(() => {
  const dispatch = useDispatch()
  const handleClick = useCallback(() => {
    dispatch(refreshPolling())
  }, [dispatch])

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
        <b>{BRAND_NAME}</b>
        <Link to='https://github.com/pravosleva/hacker-news-client-2024' target='_blank'>
          <Button
            variant='text'
            startIcon={<GitHubIcon />}
            size='small'
          >
            GitHub
          </Button>
        </Link>
      </div>
      <div className={baseClasses.stack1}>
        <ErrorBoundary
          fallbackRender={ErrorFallback}
          onReset={() => dispatch(resetMainRequestResult())}
        >
          <NewsList />
        </ErrorBoundary>
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
        <Button
          variant='outlined'
          onClick={handleClick}
          startIcon={<RefreshIcon />}
          size='small'
        >
          Update
        </Button>
      </div>
    </Layout>
  )
})
