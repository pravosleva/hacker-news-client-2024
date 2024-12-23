import { useRef, useState, useCallback, memo, useLayoutEffect } from 'react'
import baseClasses from '~/App.module.scss'
// import { Alert, Loader } from '~/common/components/sp-custom'
import clsx from 'clsx'
import { NResponse } from '~/common/utils/httpClient/types'
import { Alert } from '@mui/material'

type TProps<T> = {
  delay?: number;
  resValidator: (data: any) => boolean;
  _resFormatValidator?: (json: any) => boolean;
  onEachResponse?: ({ data }: { data: T }) => void;
  onSuccess: ({ data }: { data: T }) => void;
  promise: () => Promise<T>;
  isDebugEnabled?: boolean;
  renderer?: ({ isWorking }: { isWorking: boolean }) => React.ReactNode;
};

export const PollingComponent = memo(({
  delay = 1000,
  resValidator,
  _resFormatValidator,
  onEachResponse,
  onSuccess,
  promise,
  isDebugEnabled,
  renderer,
}: TProps<NResponse.TMinimalStandart<any>>) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isWorking, setIsWorking] = useState<boolean>(true)
  const [retryCounter, setRetryCounter] = useState<number>(0)
  const [lastResponse, setLastResponse] = useState<NResponse.TMinimalStandart<any> | null>(null)

  const updateCounterIfNecessary = useCallback(async () => {
    await promise()
      .then((data) => {
        setLastResponse(data)
        if (resValidator(data)) {
          setIsWorking(false)
          onSuccess({ data })
        }
        else setRetryCounter((c) => c + 1)
      })
      .catch((_err: any) => {
        setLastResponse(_err)

        setRetryCounter((c) => c + 1)
      })
  }, [onSuccess, promise, resValidator, setIsWorking])

  useLayoutEffect(() => {
    if (isDebugEnabled) console.log('--- eff: PollingComponent init')
  }, [isDebugEnabled])

  useLayoutEffect(() => {
    if (
      !!lastResponse
      && !!onEachResponse
      && (_resFormatValidator ? _resFormatValidator(lastResponse?.targetResponse) : true)
    ) onEachResponse({ data: lastResponse })
  }, [lastResponse, onEachResponse, _resFormatValidator])

  useLayoutEffect(() => {
    if (typeof timeoutRef.current !== 'undefined' && !!timeoutRef.current) clearTimeout(timeoutRef.current)
    else updateCounterIfNecessary()
    
    timeoutRef.current = setTimeout(updateCounterIfNecessary, delay)

    return () => {
      if (!!timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [retryCounter, updateCounterIfNecessary, delay])

  useLayoutEffect(() => {
    if (!isWorking && !!timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [isWorking])

  switch(true) {
    case isDebugEnabled:
      return (
        <>
          {!!renderer && renderer({ isWorking })}
          <div className={baseClasses.stack2}>
            <h2 className='text-3xl font-bold'><code className={baseClasses.inlineCode}>PollingComponent</code> debug</h2>

            {isWorking && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                Loader...
              </div>
            )}

            <Alert
              title={`retries: ${retryCounter} | work state: ${String(isWorking)}`}
              severity={lastResponse?.ok ? 'success' : 'error'}
              variant='outlined'
            >
              <pre className={clsx('text-sm', baseClasses.preNormalized)}>{JSON.stringify(lastResponse, null, 2)}</pre>
            </Alert>
          </div>
        </>
      )
    default:
      return !!renderer ? renderer({ isWorking }) : null
  }
})
