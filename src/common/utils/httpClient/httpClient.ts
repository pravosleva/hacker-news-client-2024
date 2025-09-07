import axios, { CancelTokenSource } from 'axios'
import { API, TAPIProps } from './API'
import { ENewsMode, TMetaCacheSample, TNewsItemDetails } from '~/common/store/reducers/newsSlice/types'
import { NResponse } from './types'

const VITE_BASE_API_URL = import.meta.env.VITE_BASE_API_URL

class Singleton extends API {
  private static instance: Singleton
  private getNewsTokenSource: CancelTokenSource

  private constructor(ps: TAPIProps) {
    super(ps)
    this.getNewsTokenSource = axios.CancelToken.source()
  }

  public static getInstance(ps: TAPIProps): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton(ps)

    return Singleton.instance
  }

  async getNews({ newsMode }: {
    newsMode: ENewsMode;
  }): Promise<{
    ok: boolean;
    message?: string;
    targetResponse?: number[];
  }> {
    this.getNewsTokenSource.cancel('axios request canceled')
    this.getNewsTokenSource = axios.CancelToken.source()

    const data = await this.api<number[]>({
      url: `/${newsMode}.json?print=pretty`,
      method: 'GET',
      cancelToken: this.getNewsTokenSource.token,
    })
    
    this.getNewsTokenSource.cancel('axios request done')

    switch (true) {
      case data.ok:
        return Promise.resolve(data)
      default:
        return data.ok ? Promise.resolve(data) : Promise.reject(data)
    }
  }

  async getNewsItem({ id }: {
    id: number;
  }): Promise<{
    ok: boolean;
    message?: string;
    targetResponse?: TNewsItemDetails;
  }> {
    if (Number.isNaN(id)) return Promise.reject({ ok: false, message: 'Incorrect param id.' })

    const data = await this.api<TNewsItemDetails>({
      url: `/item/${id}.json?print=pretty`,
      method: 'GET',
    })
    
    switch (true) {
      case data.ok === true:
        return Promise.resolve(data)
      default:
        return data.ok ? Promise.resolve(data) : Promise.reject(data)
    }
  }

  async getNewsItemMeta({ externalUrl }: {
    externalUrl: string;
  }): Promise<NResponse.TMinimalStandart<TMetaCacheSample>> {
    if (!externalUrl) return Promise.reject({ ok: false, message: 'Incorrect param externalUrl.' })

    try {
      const data = await axios.get(
        `https://pravosleva.pro/express-helper/url-metadata/editorjs?url=${encodeURI(externalUrl)}`)
      
      /* NOTE: ERR sample
      {
        "success": 0,
        "error": {
          "code": "ECONNRESET",
          "path": null,
          "host": "twitter.com",
          "port": 443
        }
      }
      */
      switch (true) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        case !!(data?.data as { success: 0 | 1; meta?: TMetaCacheSample; error: string | {[key: string]: any}; }).meta:
          return Promise.resolve({
            ok: true,
            targetResponse: data.data,
          })
        default:
          return Promise.reject({
            ok: false,
            message: `Incorrect response with status ${data.statusText}`,
            targetResponse: data.data,
          })
      }
    } catch (err) {
      return Promise.reject({
        ok: false,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        message: err?.message || 'No err.message',
        // targetResponse: err,
      })
    }
  }
}

export const httpClient = Singleton.getInstance({
  isDebugEnabled: false,
  baseApiUrl: VITE_BASE_API_URL,
})
