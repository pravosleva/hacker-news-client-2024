const t0 = performance.now()
const tsT0 = new Date().getTime()
const _perfInfo = {
  tsList: [
    {
      descr: '[w]: Worker init',
      p: t0,
      ts: tsT0,
      name: 'Начало загрузки Worker',
      // NOTE: Optional
      // data?: { input: { opsEventType: NEvents.EMetrixClientOutgoing.SP_MX_EV; stateValue: string; } } | any;
    },
  ]
}

importScripts('../utils/events/types.js')
importScripts('../utils/events/eValidator.js')
importScripts('../utils/debug/debugConfig.js')
importScripts('../utils/debug/tools.js')
importScripts('../utils/fetchRetry.js')
importScripts('../utils/middlewares/withRootMW.js')

var window = self;

(async function selfListenersInit({ self }) {
  const t1 = performance.now()
  const tsT1 = new Date().getTime()
  _perfInfo.tsList.push({ descr: '[w]: selfListenersInit', p: t1, ts: tsT1, label: 'Инициализация обработчиков Worker' })

  if (debugConfig.swState.isEnabled) log({ label: '⚪ Worker loaded...' })

  self.onmessage = (e) => {
    if (!e) return;

    _perfInfo.tsList.push({
      descr: `c->[w:listener]: ${NES.Worker.ENative.MESSAGE}`,
      p: performance.now(),
      ts: new Date().getTime(),
      data: e.data,
      name: 'Worker отловил сообщение от клиента',
    })

    // -- NOTE: We can validate all events from client to worker...
    const validationResult = eValidator({
      event: e.data,
      rules: {
        __eType: {
          type: 'string',
          descr: 'Action type',
          isRequired: true,
          validate: (val) => {
            const result = { ok: true }
            switch (true) {
              case typeof val !== 'string':
                result.ok = false
                result.reason = 'Value type should be a string'
                break
              case !val:
                result.ok = false
                result.reason = 'Value type should not be empty'
                break
              case (
                !Object.values(NES.Common.WorkerService).includes(val)
                || !Object.values(NES.Common.ClientService.News.EClientToWorkerEvent).includes(val)
              ):
                result.ok = false
                result.reason = `Double check the unknown __eType prop of your event. Received value: "${val}" (${typeof val})`
                break
              default:
                break
            }
            return result
          },
        }
      },
    })
    if (!validationResult.ok) {
      if (debugConfig.workerEvs.fromClient.isEnabled) log({
        label: `⛔ Event ${e.__eType} blocked | ${validationResult.reason || 'No reason'}`,
        msgs: [e.input, validationResult],
      })
      return
    }
    // --

    if (debugConfig.workerEvs.fromClient.isEnabled) log({
      label: 'message received Worker receive evt by client',
      msgs: [e.data],
    })

    switch (e.data.__eType) {
      case NES.Worker.Custom.EType.CLIENT_TO_WORKER_DIE:
        self.close() // NOTE: terminates ...
        break
      case NES.Common.WorkerService.CLIENT_TO_WORKER_RESET_HISTORY:
        const [loadReport] = _perfInfo.tsList
        _perfInfo.tsList = [
          loadReport, {
            descr: 'c->[w]: Worker history reset',
            p: performance.now(),
            ts: new Date().getTime(),
            name: 'Сброс истории Worker',
          },
        ]
        self.postMessage({
          __eType: NES.Common.WorkerService.WORKER_TO_CLIENT_RESET_HISTORY_OK,
          data: { tsList: _perfInfo.tsList },
        })
        break
      default: {
        const {
          data: {
            // __eType,
            input,
          }
        } = e
  
        if (!!input?.opsEventType) {
          _perfInfo.tsList.push({
            descr: `c->[w:listener:opsEventType]->cb->client: ${input.opsEventType}`,
            p: performance.now(),
            ts: new Date().getTime(),
            data: e.data,
            name: 'Worker получил ивент для использования одного из сервисов',
          })

          // -- NOTE: Middlewares section
          withRootMW({
            eventData: e.data,
            cb: {
              [NES.Common.ClientService.News.EClientToWorkerEvent.GET_NEWS]: ({ output, _service }) => {
                _perfInfo.tsList.push({
                  descr: `c->w:listener:opsEventType->[cb]->client: ${input.opsEventType}`,
                  p: performance.now(),
                  ts: new Date().getTime(),
                  data: e.data,
                  name: 'Worker получил результат от своего сервиса',
                })

                const sendError = () => {
                  self.postMessage({
                    __eType: NES.Common.ClientService.News.EWorkerToClientEvent.ITEM_ERRORED,
                    data: {
                      _service: {
                        tsList: _perfInfo.tsList,
                        ..._service,
                      },
                      output,
                    },
                  })
                }
                const sendData = () => {
                  self.postMessage({
                    __eType: NES.Common.ClientService.News.EWorkerToClientEvent.ITEM_RECEIVED,
                    data: {
                      _service: {
                        tsList: _perfInfo.tsList,
                        ..._service,
                      },
                      output,
                    },
                  })
                }
                
                switch (true) {
                  case !output.ok:
                    // NOTE: Send error
                    sendError()
                    // -- NOTE: (Exp) Отправим в любом случае?
                    // sendData()
                    // --
                    break
                  default:
                    // NOTE: Success
                    sendData()
                    break
                }
              }
            },
          })
          // --
        }
        break
      } 
    }

    // const t1 = performance.now()

    // self.postMessage({ output, perf: t1 - t0, type: e.data.type })
  }
  
})({ self })