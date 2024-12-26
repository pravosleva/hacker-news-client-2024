/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelToken } from 'axios'
import clsx from 'clsx'
import * as rax from 'retry-axios' // NOTE: See also https://www.npmjs.com/package/retry-axios
import { groupLog, TGroupLogProps } from '~/common/utils'
import { TRaxConfig, TAPIProps } from './types'

// const isProd = process.env.NODE_ENV === 'production'

type TApiInstanceProps = {
  url: string;
  method: 'POST' | 'GET';
  data?: any;
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
        } catch (err: any) {
          msgs.push(`ERR (impossible): Не удалось проанализировать попытку запроса: ${err.message || 'No err.message'}`)
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
      } catch (err: any) {
        return { ok: false, res: axiosRes?.data || err, message: err?.message || 'No err.message' }
      }
    }
  }

  async api<T>({ url, method, data, cancelToken }: TApiInstanceProps): Promise<{ ok: boolean; message?: string; targetResponse: T }> {
    const axioOpts: AxiosRequestConfig<TApiInstanceProps> = {
      method,
      url,
      // @ts-ignore
      mode: 'cors',
      cancelToken,
    }
    if (data) axioOpts.data = data

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
      .then(({ res }) => {
        return {
          ok: true,
          message: '[DBG] Response modified in API instance',
          targetResponse: res,
        }
      })
      .catch((err: any) => {
        const _msgs = []
        try {
          _msgs.push(err?.toString())
        } catch (er: any) {
          _msgs.push(`[DBG] ERR: ${err?.message || er?.message || 'No er.message'}`)
        }
        // eslint-disable-next-line no-extra-boolean-cast
        if (!!err?.response?.config.url) _msgs.push(err?.response?.config.url)

        if (axios.isCancel(err)) {
          console.log('Request canceled', err.message)
        } else {
          switch (true) {
            case err instanceof AxiosError:
              // console.log(err?.response)
              // return { ok: false, message: err.message, res: err?.response?.data || { ok: false, message: _msg } }
              return {
                ok: false,
                message: [..._msgs].join(' • '),
                targetResponse: err?.response,
              }
            default:
              return {
                ok: false,
                message: err?.message,
                targetResponse: err,
              }
          }
        }
        return {
          ok: false,
          message: [..._msgs].join(' • '),
          targetResponse: err,
        }
      })

    return result.ok ? Promise.resolve(result) : Promise.reject(result)
  }
}
