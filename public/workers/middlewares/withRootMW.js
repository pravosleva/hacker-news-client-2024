importScripts('../middlewares/withNewsService.js')

const compose = (fns, arg) => {
  return fns.reduce(
    (acc, fn) => {
      fn(arg)
      acc += 1
      return acc
    },
    0
  )
}

const withRootMW = (arg) => compose([
  withNewsService,
  // NOTE: You can add your middlewares below...

  // -- NOTE: For example
  // ({ __eType, input }) => {},
  // --
], arg)
