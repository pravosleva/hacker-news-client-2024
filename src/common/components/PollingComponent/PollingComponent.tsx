import { useRef, useState, useCallback, useLayoutEffect } from 'react'
import baseClasses from '~/App.module.scss'
import { NResponse } from '~/common/utils/httpClient/types'
import { Alert } from '@mui/material'
import { groupLog } from '~/common/utils'

type TResValidator<T> = (data: T) => boolean;
type TProps<T, TER> = {
  delay?: number;
  resValidator: TResValidator<T>;
  _resFormatValidator?: TResValidator<TER | undefined>;
  onEachResponse?: ({ data }: { data: T }) => void;
  onSuccess: ({ data }: { data: T }) => void;
  promise: () => Promise<T>;
  isDebugEnabled?: boolean;
  renderer?: ({ isWorking }: { isWorking: boolean }) => React.ReactNode;
};

export function PollingComponent<TExpectedResult>({
  delay = 1000,
  resValidator,
  _resFormatValidator,
  onEachResponse,
  onSuccess,
  promise,
  isDebugEnabled,
  renderer,
}: TProps<NResponse.TMinimalStandart<TExpectedResult>, TExpectedResult>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isWorking, setIsWorking] = useState<boolean>(true)
  const [retryCounter, setRetryCounter] = useState<number>(0)
  const [lastResponse, setLastResponse] = useState<NResponse.TMinimalStandart<TExpectedResult> | null>(null)

  const updateCounterIfNecessary = useCallback(async () => {
    await promise()
      .then((data) => {
        setLastResponse(data as NResponse.TMinimalStandart<TExpectedResult>)
        if (resValidator(data)) {
          setIsWorking(false)
          onSuccess({ data: data as NResponse.TMinimalStandart<TExpectedResult> })
        }
        else setRetryCounter((c) => c + 1)
      })
      .catch((err: unknown) => {
        switch (true) {
          case err instanceof Error:
            setLastResponse({
              ok: false,
              message: err?.message,
              targetResponse: undefined,
            })
            break
          case typeof (err as NResponse.TMinimalStandart<TExpectedResult>)?.message === 'string': {
            const errCopy = err as NResponse.TMinimalStandart<TExpectedResult>
            setLastResponse({
              ok: false,
              message: errCopy?.message,
              targetResponse: errCopy?.targetResponse,
            })
            break
          }
          default:
            groupLog({
              namespace: 'POLL: ⛔ Unknown error format',
              items: [err]
            })
            setLastResponse({ ok: false, message: 'Unknown error format', targetResponse: undefined })
            break
        }

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
              <pre className={baseClasses.preNormalized}>{JSON.stringify(lastResponse, null, 2)}</pre>
            </Alert>
          </div>
        </>
      )
    default:
      return !!renderer ? renderer({ isWorking }) : null
  }
}
