export namespace NWService {
  export enum EClientToWorkerEvent {
    DIE_WORKER = 'c-w:die-worker',
    RESET_WORKER_HISTORY = 'c-w:reset-worker-history',
    MESSAGE = 'c-w:message',

    GET_NEWS = 'c-w:news:get-items',
  }
  export enum EWorkerToClientEvent {
    MESSAGE = 'w-c:message',

    NEWS_ITEM_RECEIVED = 'w-c:news:item-received',
    NEWS_ITEM_ERRORED = 'w-c:news:item-errored',
  }
  export type TNewsItemDataResult<T> = {
    ok: boolean;
    message?: string;
    originalResponse?: T;
  }
}