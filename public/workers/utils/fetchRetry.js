function wait(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

function fetchRetry({
  url,
  delay = 1000,
  tries = 3,
  nativeFetchOptions = {},
  cb,
}) {
  let __triesLeft = tries
  if (!!cb && typeof cb?.onEachAttempt === 'function') cb.onEachAttempt({
    __triesLeft,
      tries,
      url,
  })
  function onError(err) {
    const msgs = []
    if (!!err && typeof err?.message === 'string' && !!err.message)
      msgs.push(err.message)
    
    msgs.push(`Attempt ${tries - __triesLeft + 1} of ${tries}`)
    __triesLeft -= 1
    if (
      typeof cb?.onFinalError === 'function'
      && __triesLeft <= 0
    ) {
      const r = {
        __triesLeft,
        tries,
        url,
        message: msgs.join(', '),
      }
      cb.onFinalError(r)

      return Promise.reject(r)
    }
    if (__triesLeft <= 0)
      throw new Error(msgs.join(', '))

    return wait(delay).then(() => fetchRetry({ url, delay, tries: __triesLeft, nativeFetchOptions }))
  }
  return fetch(url, nativeFetchOptions)
    .then(response => {
      if (!response.ok)
        throw new Error('Network response was not ok')

      return response.json()
    })
    .catch(onError)
}
