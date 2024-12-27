const delay = (ms = 1000) => new Promise((res, _rej) => {
  setTimeout(res, ms)
})
const isTsActual = ({ limit, ts }) => {
  const nowTs = new Date().getTime()
  return nowTs - ts <= limit
}

const cache = new Map() // NOTE: nNewsItemId => { ts, data }
const getNewsItemFromCache = ({ nNewsItemId, tsLimit = 1 * 1000 }) => {
  const res = {
    ok: false,
    data: null,
  }
  const personInfo = cache.get(nNewsItemId)
  if (!!personInfo && !!personInfo.ts && isTsActual({ limit: tsLimit, ts: personInfo.ts })) {
    res.ok = true
    res.data = personInfo.data
  }
  return res
}

const controllers = {}
let currectControllerKey = '0'

const withNewsService = async ({
  eventData,
  cb,
}) => {
  const {
    __eType,
    input,
  } = eventData
  let output = {
    ok: false,
    message: 'Output data not modified',
  }

  // if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
  //   label: `[DBG] c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[before switch (__eType)]`,
  //   msgs: [
  //     `__eType -> ${__eType}`,
  //     `eventData?.input.opsEventType -> ${eventData?.input.opsEventType}`,
  //     `NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE -> ${NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE}`,
  //   ],
  // })

  // - NOTE: Level 1: Client-Worker events
  switch (__eType) {
    case NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE: {
      // -- NOTE: Level 2: Different app event types
      switch (eventData?.input.opsEventType) {
        case NES.Common.ClientService.News.EClientToWorkerEvent.GET_NEWS: {
          if (typeof eventData?.input.dataPackKey === 'number')
            currectControllerKey = String(eventData?.input.dataPackKey)

          // --- NOTE: For example
          // await delay(3000)
          // output = {
          //   ok: true,
          //   message: 'Test async op (TODO: GET_PERSONS_DATA)',
          //   data: <ORIGINAL_RESPONSE>,
          // }
          // ---

          const { newsIds, baseApiUrl } = eventData?.input
          let _c = 0
          const _total = newsIds.length

          if (typeof eventData?.input?.dataPackKey === 'number') {
            switch (true) {
              case !controllers[String(eventData?.input?.dataPackKey)]:
                // NOTE: Cleanup old controllers and start new
                for (const key in controllers) {
                  controllers[key].abort()
                  delete controllers[key]
                  // controllers[String(eventData?.input?.dataPackKey)].abort()
                }
                
                controllers[String(eventData?.input?.dataPackKey)] = new AbortController()
                break
              default:
                // NOTE: Go on...
                break
            }
          }

          for (const id of newsIds) {
            if (String(eventData?.input?.dataPackKey) !== currectControllerKey) break
            const newsItemFromCahce = getNewsItemFromCache({ nNewsItemId: id })
            if (newsItemFromCahce.ok && newsItemFromCahce.data) {
              output = newsItemFromCahce.data
            } else {
              output = await fetchRetry({
                url: `${baseApiUrl}/item/${id}.json?print=pretty`,
                delay: 2 * 1000,
                tries: 2,
                nativeFetchOptions: {
                  method: 'GET',
                  // headers: { 'Content-Type': 'application/json' },
                  // body: JSON.stringify({ nNewsItemId: id }),
                  // signal: abortController.signal,
                  signal: controllers[String(eventData?.input?.dataPackKey)].signal
                },
                cb: {
                  onEachAttempt: ({ __triesLeft, tries, url }) => {
                    if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
                      label: `#${_c} onEachAttempt: ${tries - __triesLeft + 1} of ${tries}`,
                      msgs: [id, url],
                    })
                  },
                  onFinalError: (arg) => {
                    /// const { __triesLeft, tries, url, err } = arg
                    if (debugConfig.api.responseByServer.isEnabled) console.log(arg)

                    try {
                      cb[eventData?.input?.opsEventType]({
                        output,
                        _service: {
                          id,
                          counters: {
                            current: _c,
                            total: _total,
                          },
                          ...arg,
                        },
                      })
                    } catch (err) {
                      console.log(err)
                    }
                  },
                },
              })
                .then((result) => {
                  // const result = await res.json()
                  const eventValidationResult = eValidator({
                    event: result,
                    rules: {
                      by: {
                        isRequired: true,
                        type: 'string',
                        descr: 'Автор статьи',
                        validate: (val) => ({ ok: typeof val === 'string' && !!val, reason: 'Ожидается непустая строка' }),
                      },
                      descendants: {
                        isRequired: false,
                        type: 'number',
                        descr: 'В случае с историями или опросами учитывается общее количество комментариев.',
                        validate: (val) => ({ ok: typeof val === 'number', reason: 'Ожидается число' }),
                      },
                      id: {
                        isRequired: true,
                        type: 'number',
                        descr: 'ID',
                        validate: (val) => ({ ok: typeof val === 'number', reason: 'Ожидается число' }),
                      },
                      kids: {
                        isRequired: false,
                        type: 'number[]',
                        descr: 'Идентификаторы комментариев к элементу в порядке ранжирования.',
                        validate: (val) => ({ ok: Array.isArray(val) && val.every((e) => typeof e === 'number'), message: 'Ожидается массив чисел' }),
                      },
                      score: {
                        isRequired: true,
                        type: 'number',
                        descr: 'Рейтинг истории или количество голосов в опросе',
                        validate: (val) => ({ ok: typeof val === 'number', reason: 'Ожидается число' }),
                      },
                      time: {
                        isRequired: true,
                        type: 'number',
                        descr: 'Creation date as Unix Time',
                        validate: (val) => ({ ok: typeof val === 'number', reason: 'Ожидается число' }),
                      },
                      title: {
                        isRequired: false,
                        type: 'string',
                        descr: 'Название истории, опроса или вакансии. HTML.',
                        validate: (val) => ({ ok: typeof val === 'string' && !!val, reason: 'Ожидается непустая строка' }),
                      },
                      text: {
                        isRequired: false,
                        type: 'string',
                        descr: 'The comment, story or poll text. HTML.',
                        validate: (val) => ({ ok: typeof val === 'string' && !!val, reason: 'Ожидается непустая строка' }),
                      },
                      type: {
                        isRequired: true,
                        type: 'job|story|comment|poll|pollopt',
                        descr: 'The type of item. One of "job", "story", "comment", "poll", or "pollopt".',
                        validate: (val) => {
                          const possibleVals = ['job', 'story', 'comment', 'poll', 'pollopt']
                          return {
                            ok: typeof val === 'string' && possibleVals.includes(val),
                            reason: 'Ожидается значение из списка допустимых',
                          }
                        },
                      },
                      url: {
                        isRequired: false,
                        type: 'string',
                        descr: 'URL-адрес истории.',
                        validate: (val) => ({ ok: typeof val === 'string' && !!val, reason: 'Ожидается непустая строка' }),
                        // TODO: Url could be validated too
                      },
                    },
                  })
                  switch (true) {
                    case !eventValidationResult.ok:
                      return {
                        ok: false,
                        message: `ERR1: Incorrect data for #${id}. ${eventValidationResult.reason}`,
                        data: result,
                      }
                    default:
                      return {
                        ok: true,
                        message: 'Данные проверены успешно',
                        data: result,
                      }
                  }
                })
                .catch((err) => {
                  return {
                    ok: false,
                    message: err.message,
                    data: err?.data || err,
                  }
                })

              if (!!output && output.ok) cache.set(id, { ts: new Date().getTime(), data: output })
            }

            _c += 1
            const _service = {
              id,
              counters: {
                current: _c,
                total: _total,
              },
            }
            if (typeof cb[eventData?.input?.opsEventType] === 'function') {
              // console.log(eventData?.input?.opsEventType) // NOTE: c-w:news:get-items
              if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
                label: `c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[cb]`,
                msgs: ['input', input, 'output', output],
              })

              cb[eventData.input.opsEventType]({
                output: {
                  originalResponse: output.data,
                  ...output,
                },
                input,
                _service,
              })
            }

            // await delay(100)
          }
          break
        }
        default: break
      }
      // --

      break
    }
    default:
      if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
        label: `[DBG] UNKNOWN CASE! Проверте __eType! c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[switch (__eType)]`,
        msgs: [
          `__eType: ${__eType}`,
          'eventData?.input.opsEventType',
          eventData?.input?.opsEventType
        ],
      })
      break
  }
  // -
}
