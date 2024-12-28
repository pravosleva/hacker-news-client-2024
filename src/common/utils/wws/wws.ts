import { groupLog } from '~/common/utils/groupLog'
import { getSplittedCamelCase } from '~/common/utils/string-ops'
import { NWService } from './types'
import packageJson from '../../../../package.json'

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL

type TProps = {
  noSharedWorkers?: boolean;
  isDebugEnabled?: boolean;
}
type TTsListItem = {
  label: string;
  descr: string;
  p: number;
  ts: number;
}

class Singleton {
  private static instance: Singleton
  private workers: {
    [key: string]: SharedWorker | Worker;
  };
  private noSharedWorkers: boolean | undefined;
  private isDebugEnabled: boolean | undefined;
  public activeIncomingChannels: {
    [key: string]: number;
  };

  private constructor({ noSharedWorkers, isDebugEnabled }: TProps) {
    this.noSharedWorkers = noSharedWorkers
    this.isDebugEnabled = isDebugEnabled
    this.workers = {}
    this.activeIncomingChannels = {}

    this.initWorker({ wName: 'newsWorker' })
    this.activeIncomingChannels.newsWorker = 0
    // NOTE: Other workers could be loaded and used...
  }
  public setActiveIncomingChannels({ wName, value }: {
    wName: string;
    value: number;
  }): Promise<{
    ok: boolean;
    message?: string;
  }> {
    this.activeIncomingChannels[wName] = value
    return Promise.resolve({ ok: true })
  }
  private initWorker({ wName }: {
    wName: string;
  }): Promise<{
    ok: boolean;
    message?: string;
  }> {
    const result: { ok: boolean; message?: string; } = { ok: true }

    const firstWord = getSplittedCamelCase(wName)[0]
    if (!firstWord) {
      result.ok = false
      result.message = 'Incorrect Worker name (Should be string in camelCase)'
      return Promise.reject(result)
    }

    try {
      switch (true) {
        case this.noSharedWorkers:
          this.workers[wName] = new Worker(`${PUBLIC_URL}/workers/${firstWord}/dedicated-worker.js?v=${packageJson.version}&ts=${new Date().getTime()}`)
          break
        default:
          this.workers.newsWorker = typeof SharedWorker !== 'undefined'
            ? new SharedWorker(`${PUBLIC_URL}/workers/${firstWord}/shared-worker.js?v=${packageJson.version}&ts=${new Date().getTime()}`)
            : new Worker(`${PUBLIC_URL}/workers/${firstWord}/dedicated-worker.js?v=${packageJson.version}&ts=${new Date().getTime()}`)
          if (typeof SharedWorker !== 'undefined' && this.workers.newsWorker instanceof SharedWorker) this.workers.newsWorker.port.start()
          break
      }
      return Promise.resolve(result)
    } catch (_err: unknown) {
      this.workers.newsWorker = new Worker(`${PUBLIC_URL}/workers/${firstWord}/dedicated-worker.js?v=${packageJson.version}&ts=${new Date().getTime()}`)
      return Promise.reject(result)
    }
  }
  public reInitWorker({ wName, ifNecessaryOnly }: {
    wName: string;
    ifNecessaryOnly?: boolean;
  }): Promise<{ ok: boolean; message?: string; }> {
    switch (true) {
      case !!this.workers[wName] && !ifNecessaryOnly:
        if (this.isDebugEnabled) groupLog({
          namespace: 'Terminate -> Reinit, cuz exists and !ifNecessaryOnly',
          items: [],
        })
        this.terminate({ wName })
        return this.initWorker({ wName })
      case typeof this.workers[wName] === 'undefined':
        if (this.isDebugEnabled) groupLog({
          namespace: 'Reinit, cuz not exists',
          items: [],
        })
        return this.initWorker({ wName })
      default:
        return Promise.resolve({ ok: true, message: 'Already exists' })
    }
  }
  public static getInstance(props: TProps): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton(props)

    return Singleton.instance
  }
  private log ({ label, msgs }: {
    label: string;
    msgs?: unknown[];
  }): void {
    if (this.isDebugEnabled) groupLog({ namespace: `-webWorkersInstance: ${label}`, items: msgs || [] })
  }

  public async subscribeOnData<T>({ wName, cb }: {
    wName: string;
    cb: (d: MessageEvent<T>) => void;
  }) {

    if (!this.workers[wName]) {
      // throw new Error(`No worker ${wName} yet #1`)
      await this.reInitWorker({ wName, ifNecessaryOnly: true })
    }

    switch (true) {
      case this.workers[wName] instanceof Worker:
        this.workers[wName].onmessage = cb.bind(this)
        break
      case typeof SharedWorker !== 'undefined' && this.workers[wName] instanceof SharedWorker:
        this.workers[wName].port.onmessage = cb.bind(this)
        break
      default:
        break
    }
  }

  public async subscribeOnErr<T>({ wName, cb }: {
    wName: string;
    cb: (d: MessageEvent<T>) => void;
  }) {
    if (!this.workers[wName]) {
      // throw new Error(`No worker ${wName} yet #2`)
      await this.reInitWorker({ wName, ifNecessaryOnly: true })
    }

    switch (true) {
      case this.workers[wName] instanceof Worker:
        this.workers[wName].onmessageerror = cb.bind(this)
        break
      case typeof SharedWorker !== 'undefined' && this.workers[wName] instanceof SharedWorker:
        this.workers[wName].port.onmessageerror = cb.bind(this)
        break
      default:
        break
    }
  }

  public async post<T>(e: {
    wName: string;
    eType: string;
    data?: T;
  }) {
    const { wName, eType, data } = e
    if (!this.workers[wName]) {
      // throw new Error(`No worker ${wName} yet #3`)
      await this.reInitWorker({ wName, ifNecessaryOnly: true })
    }

    switch (true) {
      case this.workers[wName] instanceof Worker:
        this.workers[wName].postMessage({ __eType: eType, ...data })
        break
      case typeof SharedWorker !== 'undefined' && this.workers[wName] instanceof SharedWorker:
        this.log({ label: 'before post to sw...', msgs: [e] })
        this.workers[wName].port.postMessage({ __eType: eType, ...data })
        break
      default:
        break
    }
  }

  public terminate({ wName, cb }: {
    wName: string;
    cb?: (d: unknown) => void;
  }) {
    // if (!this.workers[wName]) throw new Error(`No worker ${wName} yet #4`)
    if (!this.workers[wName]) return

    switch (true) {
      case this.workers[wName] instanceof Worker:
        this.workers[wName].terminate()
        break
      case typeof SharedWorker !== 'undefined' && this.workers[wName] instanceof SharedWorker:
        this.workers[wName].port.postMessage({ __eType: NWService.EClientToWorkerEvent.DIE_WORKER })
        break
      default:
        break
    }
    delete this.workers[wName]
    if (cb) cb({ ok: true })
  }

  public resetHistory({ wName }: {
    wName: string;
  }): void {
    if (!this.workers[wName]) throw new Error(`No worker ${wName} yet #5`)

    this.post<{
      tsList: TTsListItem[];
    }>({
      wName,
      eType: NWService.EClientToWorkerEvent.RESET_WORKER_HISTORY,
    })
  }
  public resetOpsWorkerHistory() {
    this.resetHistory({ wName: 'newsWorker' })
  }
}

export const wws = Singleton.getInstance({
  noSharedWorkers: true,
  isDebugEnabled: true,
})
