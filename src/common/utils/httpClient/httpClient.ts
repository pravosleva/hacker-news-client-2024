import axios, { CancelTokenSource } from 'axios'
import { API, TAPIProps } from './API'
import { ENewsMode, TNewsItemDetails } from '~/common/store/reducers/newsSlice/types'

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
  }): Promise<{ ok: boolean; message?: string; targetResponse: number[] }> {
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
  }): Promise<{ ok: boolean; message?: string; targetResponse: TNewsItemDetails }> {
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
}

export const httpClient = Singleton.getInstance({
  isDebugEnabled: false,
  baseApiUrl: VITE_BASE_API_URL,
})
