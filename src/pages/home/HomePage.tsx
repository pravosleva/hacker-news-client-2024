import { Button, Chip } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import { NewsList } from './components'
import { ErrorFallback } from '~/common/components'
import { ErrorBoundary } from 'react-error-boundary'
import { useDispatch, useSelector } from 'react-redux'
import { refreshPolling, ENewsMode, setNewsMode, uiDict } from '~/common/store/reducers'
import baseClasses from '~/App.module.scss'
import layoutStyles from '~/common/components/Layout/Layout.module.scss'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Layout } from '~/common/components'
import layoutClasses from '~/common/components/Layout/Layout.module.scss'
import GitHubIcon from '@mui/icons-material/GitHub'
import { Link } from 'react-router-dom'
import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { TStore } from '~/common/store'
import clsx from 'clsx'
import { TimeAgo } from '~/common/components/TimeAgo'
// import { useStore as useMainCtx } from '~/common/context/MainNewsListUpdateLogic'

const BRAND_NAME = import.meta.env.VITE_BRAND_NAME

export const HomePage = memo(() => {
  const dispatch = useDispatch()
  const handleClick = useCallback(() => {
    dispatch(refreshPolling())
  }, [dispatch])

  const newsMode = useSelector((s: TStore) => s.news.newsMode)
  const handleChangeNewsMode = useCallback((e: SelectChangeEvent<ENewsMode>) => {
    dispatch(setNewsMode({ mode: (e.target.value as ENewsMode) }))
  }, [dispatch])
  const lastUpdateTsNewsList = useSelector((s: TStore) => s.news.lastUpdateTs)

  const items = useSelector((s: TStore) => s.news.items)
  const loadedCounters = useSelector((s: TStore) => s.news.loadedItemsCounters)
  const loadedTagetCounter = useMemo(() => loadedCounters[newsMode], [loadedCounters, newsMode])
  const infoText = useMemo(() => {
    switch (true) {
      case loadedTagetCounter > items.length:
        return `+${loadedTagetCounter - items.length} since last update`
      default:
        return `${loadedTagetCounter} of ${items.length}`
    }
  }, [loadedTagetCounter, items.length])

  const InfoChip = useMemo(() => items.length > 0 && (
    <Chip
      className={baseClasses.truncate}
      label={infoText}
      size='small'
      color={loadedTagetCounter > items.length ? 'success' : 'default'}
      onClick={() => {
        window.alert(infoText)
      }}
    />
  ), [items.length, infoText, loadedTagetCounter])

  const mainResponseResult = useSelector((s: TStore) => s.news.mainRequestResult)
  const isMainReuestErrored = useMemo(() => mainResponseResult?.ok === false && !!mainResponseResult.message, [mainResponseResult?.ok, mainResponseResult?.message])
  const ErrorChip = useMemo(() => isMainReuestErrored && (
    <Chip
      className={baseClasses.truncate}
      label={mainResponseResult?.message}
      size='small'
      color='error'
      onClick={() => {
        if (!!mainResponseResult?.message)
          window.alert(mainResponseResult.message)
      }}
    />
  ), [mainResponseResult?.message, isMainReuestErrored])

  return (
    <Layout>
      <div
        className={clsx(layoutStyles.stickyTop)}
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className={baseClasses.truncate}>
          <b>{BRAND_NAME}</b>
          {InfoChip}
          {ErrorChip}
        </div>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}
        >
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
      </div>
      <div className={baseClasses.stack1}>
        <ErrorBoundary
          onReset={() => dispatch(refreshPolling())}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <ErrorFallback
              error={error}
              resetErrorBoundary={resetErrorBoundary}
              customPossibleReason='Common list Error'
            />
          )}
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
          variant={loadedTagetCounter > items.length ? 'contained' : 'outlined'}
          color={
            isMainReuestErrored
            ? 'error'
            : loadedTagetCounter > items.length
              ? 'success'
              : 'primary'}
          onClick={handleClick}
          size='small'
        >
          <RefreshIcon />
        </Button>
        <FormControl
          size='small'
          variant='standard'
        >
          <Select
            size='small'
            labelId='mode-select-label'
            id='mode-select'
            value={newsMode}
            renderValue={() => <small><code>{uiDict[newsMode]}</code></small>}
            label='Mode'
            onChange={handleChangeNewsMode}
          >
            {Object.values(ENewsMode).map((str) => <MenuItem key={str} value={str}>{uiDict[str]}</MenuItem>)}
          </Select>
        </FormControl>
        <TimeAgo
          date={lastUpdateTsNewsList}
          prefix='List refreshed'
        />
      </div>
    </Layout>
  )
})
