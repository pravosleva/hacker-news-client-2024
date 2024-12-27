import { useLayoutEffect, useCallback } from 'react'
import { groupLog, wws } from '~/common/utils'
import { NWService } from '~/common/utils/wws/types'
import { TNewsItemDetails } from '~/common/store/reducers/newsSlice'
import pkg from '../../../package.json'

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL

type TProps = {
  isDebugEnabled?: boolean;
  deps: {
    newsIds: number[];
    mainPollingKey: number;
  };
  cb?: {
    beforeStart?: () => void;
    onEachNewsItemData: (data: NWService.TNewsItemDataResult<TNewsItemDetails>) => void;
    onFinalError: (ps: { id: number; reason: string }) => void;
  };
}

export const useWorkers = ({ isDebugEnabled, deps, cb }: TProps) => {
  // NOTE: 1.1 Use wws.subscribeOnData once only!
  useLayoutEffect(() => {
    if (typeof cb?.beforeStart === 'function') cb.beforeStart()
    
    // wws.reInitWorker({ wName: 'newsWorker', ifNecessaryOnly: true })
    wws.subscribeOnData<{
      __eType: NWService.EWorkerToClientEvent;
      data: {
        type: NWService.EWorkerToClientEvent;
        output: NWService.TNewsItemDataResult<TNewsItemDetails>;
        // NOTE: Input data could be compared
        input: {
          opsEventType: NWService.EClientToWorkerEvent;
          newsIds: number[];
          dataPackKey: number;
        };
        _service: {
          id: number;
          counters: {
            current: number;
            total: number;
          };
        };
      };
    }>({
      wName: 'newsWorker',
      cb: (e) => {
        switch (true) {
          case wws.activeIncomingChannels.newsWorker !== e.data.data.input.dataPackKey:
            if (isDebugEnabled) groupLog({
              namespace: `useWorkers: Ignore dataPackKey: ${e.data.data.input.dataPackKey}, current: ${wws.activeIncomingChannels.newsWorker} [${e.data.__eType}]`,
              items: ['e.data.data.input', e.data.data.input, 'e.data.data.output', e.data.data.output],
            })
            return
          default:        
            switch (e.data.__eType) {
              case NWService.EWorkerToClientEvent.NEWS_ITEM_RECEIVED:
                if (isDebugEnabled) groupLog({
                  namespace: `useWorkers: by newsWorker (on data #1) [${e.data.__eType}]`,
                  items: [
                    'e.data.data.output',
                    e.data.data.output,
                    `typeof cb?.onEachNewsItemData -> ${typeof cb?.onEachNewsItemData}`,
                  ],
                })
                if (
                  typeof cb?.onEachNewsItemData === 'function'
                  && !!e.data.data.output.originalResponse
                ) cb?.onEachNewsItemData(e.data.data.output)
                break
              case NWService.EWorkerToClientEvent.NEWS_ITEM_ERRORED:
                if (
                  typeof cb?.onFinalError === 'function'
                  && !!e.data.data.output.originalResponse
                ) cb?.onFinalError({ id: e.data.data._service.id, reason: e.data.data.output.message || 'No output.message' })
                break
              default: {
                if (isDebugEnabled) groupLog({
                  namespace: `useWorkers: by newsWorker ⚠️ (on data) UNHANDLED! [${e.data.__eType}]`,
                  items: ['e.data', e.data],
                })
                break
              }
            }
          break
        }
      },
    })

    // -- NOTE: 1.2 Additional subscribe? ⛔ Dont use this! Cuz callbacks above will be replaced
    // wws.subscribeOnData<{
    //   data: {
    //     output: any;
    //     type: NEvents.ESharedWorkerNative;
    //     yourData: { [key: string]: any; };
    //   };
    // }>({
    //   wName: 'newsWorker',
    //   cb: (e: any) => { groupLog({ namespace: e.type, items: [ e.data ] }) },
    // })
    // --

    wws.subscribeOnErr<{
      message?: string;
    }>({
      wName: 'newsWorker',
      cb: (e: MessageEvent<{
        message?: string;
      }>) => {
        if (isDebugEnabled) groupLog({
          namespace: 'useWorkers: by newsWorker 🚫 OnErr e:',
          items: [e],
        })
      },
    })

    // return () => {
    //   const wList = ['newsWorker']
    //   for (const wName of wList) {
    //     wws.terminate({
    //       wName,
    //       cb: () => {
    //         if (isDebugEnabled) groupLog({ namespace: `useWorkers: by newsWorker 🚫 die [${wName}]`, items: [] })
    //       },
    //     })
    //   }
    // }
  }, [isDebugEnabled, deps.newsIds, cb, deps.mainPollingKey])

  const sendSignalToNewsWorker = useCallback(({ input }: {
    input: {
      opsEventType: NWService.EClientToWorkerEvent;
      newsIds: number[];
      dataPackKey: number;
    }
  }) => {
    wws.post<{
      input: {
        baseApiUrl: string;
        appVersion: string;

        opsEventType: string;
        newsIds: number[];
        dataPackKey: number;
      }
    }>({
      wName: 'newsWorker',
      eType: NWService.EClientToWorkerEvent.MESSAGE,
      data: {
        input: {
          baseApiUrl: BASE_API_URL,
          appVersion: pkg.version,
          ...input,
        },
      },
    })
  }, [])

  // NOTE: 2. Send event for each change of deps
  useLayoutEffect(() => {
    sendSignalToNewsWorker({
      input: {
        opsEventType: NWService.EClientToWorkerEvent.GET_NEWS,
        newsIds: deps.newsIds,
        dataPackKey: deps.mainPollingKey,
      }
    })
  }, [isDebugEnabled, sendSignalToNewsWorker, deps.newsIds, deps.mainPollingKey])
}
