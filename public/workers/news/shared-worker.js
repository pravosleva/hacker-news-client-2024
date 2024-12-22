const t0 = performance.now()
const tsT0 = new Date().getTime()
const _perfInfo = {
  tsList: [
    {
      descr: '[sw]: SharedWorker init',
      p: t0,
      ts: tsT0,
      name: 'Начало загрузки SharedWorker',
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

var window = self
let connectionsCounter = 0
let port // TODO? var ports = new Map()

(async function selfListenersInit({ self }) {
  const t1 = performance.now()
  const tsT1 = new Date().getTime()
  _perfInfo.tsList.push({ descr: '[sw]: selfListenersInit', p: t1, ts: tsT1, label: 'Инициализация обработчиков SharedWorker' })

  if (debugConfig.swState.isEnabled) log({ label: '⚪ SharedWorker loaded...' })

  self.addEventListener(NES.SharedWorker.Native.ESelf.CONNECT, function(e) {
    _perfInfo.tsList.push({
      descr: `[sw:listener] self listener: ${NES.SharedWorker.Native.ESelf.CONNECT}`,
      p: performance.now(),
      ts: new Date().getTime(),
      name: 'SharedWorker подключен к клиенту',
    })
    if (debugConfig.swState.isEnabled) log({ label: '🟡 Client connected to SharedWorker' })
    // port = e.ports[0] // NOTE: or port = e.source
    port = e.source
    connectionsCounter++
  
    port.addEventListener(NES.SharedWorker.Native.EPort.MESSAGE, function(e) {
      // const isNew = _perfInfo.tsList[_perfInfo.tsList.length - 1].descr === e.data.
      // if () 
      _perfInfo.tsList.push({
        descr: `c->[sw:listener]: ${NES.SharedWorker.Native.EPort.MESSAGE}`,
        p: performance.now(),
        ts: new Date().getTime(),
        data: e.data,
        name: 'Порт отловил сообщение от клиента',
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
        label: 'SharedWorker received message: evt by client',
        msgs: [e.data],
      })

      switch (e.data.__eType) {
        case NES.SharedWorker.Custom.EType.CLIENT_TO_WORKER_DIE:
          self.close() // NOTE: terminates ...
          break
        case NES.Common.WorkerService.CLIENT_TO_WORKER_RESET_HISTORY:
          const [loadReport] = _perfInfo.tsList
          _perfInfo.tsList = [
            loadReport, {
              descr: 'c->[sw]: SharedWorker history reset',
              p: performance.now(),
              ts: new Date().getTime(),
              name: 'Сброс истории SharedWorker',
            },
          ]
          port.postMessage({ __eType: NES.Common.WorkerService.WORKER_TO_CLIENT_RESET_HISTORY_OK, data: { tsList: _perfInfo.tsList } })
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
              descr: `c->[sw:listener:opsEventType]->s: ${input.opsEventType}`,
              p: performance.now(),
              ts: new Date().getTime(),
              data: e.data,
              name: 'SharedWorker Получил ивент мертики для использования одного из сервисов',
            })

            // -- NOTE: Middlewares section
            withRootMW({
              eventData: e.data,
              cb: {
                [NES.Common.ClientService.News.EClientToWorkerEvent.GET_NEWS]: ({ output, _service }) => {
                  // console.log('SharedWorker -> withRootMW -> cb', NES.Common.ClientService.News.EClientToWorkerEvent.GET_NEWS)
                  _perfInfo.tsList.push({
                    descr: `c->sw:listener:opsEventType->[cb]->client: ${input.opsEventType}`,
                    p: performance.now(),
                    ts: new Date().getTime(),
                    data: e.data,
                    name: 'SharedWorker получил результат от своего сервиса',
                  })

                  const sendError = () => {
                    port.postMessage({
                      __eType: NES.Common.ClientService.News.EWorkerToClientEvent.ITEM_ERRORED,
                      data: {
                        output,
                        _service: {
                          tsList: _perfInfo.tsList,
                          ..._service,
                        },
                      },
                    })
                  }
                  const sendData = () => {
                    port.postMessage({
                      __eType: NES.Common.ClientService.News.EWorkerToClientEvent.ITEM_RECEIVED,
                      data: {
                        output,
                        _service: {
                          tsList: _perfInfo.tsList,
                          ..._service,
                        },
                      },
                    })
                  }
                  
                  switch (true) {
                    case !output.ok:
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
    }, false)
  
    port.start()
    // NOTE: https://developer.mozilla.org/ru/docs/Web/API/SharedWorker
    // необходимо при добавлении обработчиков с помощью addEventListener.
    // При использовании сеттера port.onmessage, данный метод вызывается автоматически, неявно
  }, false)
  self.addEventListener(NES.SharedWorker.Native.ESelf.ERROR, function(e) {
    _perfInfo.tsList.push({
      descr: `[sw:err]: ${e?.data?.message || 'No e.data.message'}`,
      p: performance.now(),
      ts: new Date().getTime(),
      data: { ...e },
      name: `SharedWorker отхватил ошибку: ${e?.data?.message || 'No e.data.message'}`,
    })
    log({ label: 'error in SharedWorker', msgs: [e.data] })
  })
})({ self })
