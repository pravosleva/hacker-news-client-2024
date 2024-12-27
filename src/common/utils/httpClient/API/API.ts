/* eslint-disable @typescript-eslint/ban-ts-comment */
import axios, { AxiosError, AxiosInstance, AxiosResponse, CancelToken } from 'axios'
import clsx from 'clsx'
import * as rax from 'retry-axios' // NOTE: See also https://www.npmjs.com/package/retry-axios
import { groupLog, TGroupLogProps } from '~/common/utils'
import { TRaxConfig, TAPIProps } from './types'

// const isProd = process.env.NODE_ENV === 'production'

type TApiInstanceProps = {
  url: string;
  method: 'POST' | 'GET';
  data?: {
    [key: string]: string | number;
  };
  cancelToken?: CancelToken;
}

export class API {
  axiosInstance: AxiosInstance
  isDebugEnabled: boolean

  constructor({ isDebugEnabled, baseApiUrl }: TAPIProps) {
    this.isDebugEnabled = isDebugEnabled
    const axiosInstance = this.axiosInstance = axios.create({
      baseURL: baseApiUrl,
      // timeout: 1000,
      // withCredentials: isProd,
      // headers: { 'X-Custom-Header': 'foobar' },
      // xsrfHeaderName: 'X-CSRFToken',
      // xsrfCookieName: 'csrftoken',
    })
    axiosInstance.defaults.raxConfig = {
      instance: axiosInstance,
      // NOTE: You can set the backoff type.
      // options are 'exponential' (default), 'static' or 'linear'
      backoffType: 'exponential',
      // NOTE: Retry 5 times on requests that return a response (500, etc) before giving up. Defaults to 3.
      retry: 3,
      retryDelay: 1000,
      // NOTE: Retry twice on errors that don't return a response (ENOTFOUND, ETIMEDOUT, etc).
      noResponseRetries: 2,
      httpMethodsToRetry: ['GET', 'OPTIONS', 'POST'],
      // NOTE: You can detect when a retry is happening, and figure out how many
      // retry attempts have been made
      onRetryAttempt: (err: AxiosError) => {
        // NOTE: This interceptor has lower priority than axios interceptors
        const raxConfig: TRaxConfig | undefined = rax.getConfig(err)
        const msgs = [`Retry attempt #${raxConfig?.currentRetryAttempt} || '[No raxConfig?.currentRetryAttempt]'`]

        try {
          const internalAxiosRequestConfig = err.config
          if (!internalAxiosRequestConfig?.url)
            throw new Error([
              'Неожиданный кейс: Ожидалось поле internalAxiosRequestConfig.url (строка)',
              `-> Получено: ${clsx(typeof internalAxiosRequestConfig?.url)}`,
              `(${typeof internalAxiosRequestConfig?.url})`,
            ].join(', '))
          else
            msgs.push(internalAxiosRequestConfig?.url)
        } catch (err: unknown) {
          msgs.push(`ERR (impossible): Не удалось проанализировать попытку запроса: ${(err as Error).message || 'No err.message'}`)
          console.warn(err)
        } finally {
          this.log({ namespace: 'API:rax', items: msgs })
        }
      },
    };
    // const _interceptorId = rax.attach(axiosInstance)
    // console.log(_interceptorId)
    rax.attach(axiosInstance)

    this.api = this.api.bind(this)
  }

  log(ps: TGroupLogProps) {
    if (this.isDebugEnabled) groupLog(ps)
  }

  universalAxiosResponseHandler(validator: <T>(data: T) => boolean) {
    return (axiosRes: AxiosResponse) => {
      try {
        if (!validator(axiosRes)) {
          return { ok: false, res: axiosRes.data }
        }
        return { ok: true, res: axiosRes.data }
        // NOTE: Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196)
      } catch (err: unknown) {
        return { ok: false, res: axiosRes?.data || err, message: (err as Error)?.message || 'No err.message' }
      }
    }
  }

  async api<T>({ url, method, data, cancelToken }: TApiInstanceProps): Promise<{
    ok: boolean;
    message?: string;
    targetResponse?: T;
  }> {
    const axioOpts: TApiInstanceProps = {
      method,
      url,
      // @ts-ignore
      mode: 'cors',
      cancelToken,
      data: undefined,
    }
    if (typeof data === 'object' && !!data) axioOpts.data = data

    const result = await this.axiosInstance(axioOpts)
      .then(
        this.universalAxiosResponseHandler(() => {
          // NOTE: Could be helpful later...
          // Обычно ответ содержит флаг успеха в явном виде,
          // напр., как в facebook API: { ok: boolean; message?: string }
          // наличие этого флага всегда проверяется, но сейчас это не нужно
          // return data?.ok === true || data?.ok === false
          return true
        })
      )
      .then(({ res }: { res: T }) => {
        return {
          ok: true,
          message: '[DBG] Response modified in API instance',
          targetResponse: res,
        }
      })
      .catch((err: unknown) => {
        const _msgs = ['Ошибка']
        try {
          const msg = err?.toString()
          if (typeof msg === 'string')
            _msgs.push(msg)
        } catch (er: unknown) {
          _msgs.push(`[DBG] ERR: ${(err as AxiosError)?.message || (er as Error)?.message || 'No er.message'}`)
        }

        const msg = (err as AxiosError)?.response?.config.url
        if (typeof msg === 'string' && !!msg)
          _msgs.push(msg)
        if (axios.isCancel(err)) {
          if (!!err?.message) _msgs.push(err.message)
          else _msgs.push('Request canceled')
        } else {
          switch (true) {
            case err instanceof AxiosError:
              // console.log(err?.response)
              // return { ok: false, message: err.message, res: err?.response?.data || { ok: false, message: _msg } }
              return {
                ok: false,
                message: [..._msgs].join(' • '),
                // targetResponse: (err as AxiosError)?.response,
              }
            default:
              return {
                ok: false,
                message: [..._msgs, (err as Error)?.message || 'No message'].join(' • '),
                // targetResponse: err,
              }
          }
        }
        return {
          ok: false,
          message: [..._msgs].join(' • '),
          // targetResponse: err,
        }
      })

    return result.ok ? Promise.resolve(result) : Promise.reject(result)
  }
}
