const NES = {
  // NOTE: Should be sync with NEvents.ECustom in ~/types/NEvents.ts
  Common: {
    WorkerService: {
      CLIENT_TO_WORKER_RESET_HISTORY: 'c-w:reset-worker-history',
      WORKER_TO_CLIENT_RESET_HISTORY_OK: 'w-c:reset-history-ok',
      CLIENT_TO_WORKER_MESSAGE: 'c-w:message',
    },
    ClientService: {
      // NOTE: Should be sync with NFT in ~/types/NFT.ts
      News: {
        EClientToWorkerEvent: {
          GET_NEWS: 'c-w:news:get-items',
        },
        EWorkerToClientEvent: {
          ITEM_RECEIVED: 'w-c:news:item-received',
          ITEM_ERRORED: 'w-c:news:item-errored',
        },
      },
    }
  },
  SharedWorker: {
    Native: {
      ESelf: {
        CONNECT: 'connect',
        ERROR: 'error',
      },
      EPort: {
        MESSAGE: 'message',
      },
    },
    Custom: {
      // NOTE: Should be sync with NEvents.ESharedWorkerCustom in ~/types/NEvents.ts
      EType: {
        CLIENT_TO_WORKER_DIE: 'c-w:die-worker',
      },
    },
  },
  Worker: {
    ENative: {
      MESSAGE: 'message',
    },
    Custom: {
      // NOTE: Should be sync with NEvents.EWorkerCustom in ~/types/NEvents.ts
      EType: {
        CLIENT_TO_WORKER_DIE: 'c-w:die-worker',
      },
    },
  },
}
