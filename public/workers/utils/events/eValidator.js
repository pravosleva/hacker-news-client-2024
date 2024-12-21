const eValidator = ({
  event,
  rules,
}) => {
  let _c = 0
  let res = {
    ok: true,
    // reason?: string;
  }
  const errs = [] // NOTE: TS like { msg: string, _reponseDetails?: any }[] = []

  for (const key in rules) {
    _c += 1

    // NOTE: 1. Очевидный кейс
    if (rules[key].isRequired && !event[key]) {
      res.ok = false
      errs.push({
        msg: `Missing required param: event.${key} (expected ${rules[key].type}, received ${typeof event[key]}) - ${rules[key].descr}`
      })
    }

    // NOTE: 2. В любом случае проверим параметр,
    // если передана соотв. функция
    if (!!event[key]) {
      try {
        switch (true) {
          case !!rules[key].validate && typeof rules[key].validate === 'function': {
            const validationItemResult = rules[key].validate(event[key])
    
            if (!validationItemResult.ok) {
              errs.push({
                msg: `Incorrect event.${key} format: ${!!validationItemResult.reason ? `: ${validationItemResult.reason}` : ''}`
              })
            }
            break
          }
          default:
            break
        }
      } catch (err) {
        errs.push({
          msg: `Не удалось проверить поле: event.${key} (expected ${rules[key].type}, received ${typeof event[key]}) - ${rules[key].descr}, ${typeof err === 'string' ? err : (err.message || 'No err.message')}`
        })
      }
    }
  
    if (!res.ok) {
      res._c = _c

      if (errs.length > 0) {
        res.reason = errs.map(({ msg }) => msg).join('; ')
      }

      break
    }
  }

  return res
}
