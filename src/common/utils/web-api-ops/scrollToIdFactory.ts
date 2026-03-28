export const scrollToIdFactory = ({ timeout, offsetTop, elementHeightCritery }: {
  timeout: number;
  offsetTop: number;
  elementHeightCritery: number;
}) => {
  let __timeout: NodeJS.Timeout | undefined = undefined

  return ({ id, _cfg }: {
    id: string;
    _cfg?: {
      getOffsetTop: ({ targetElm }: { targetElm: HTMLElement }) => number | undefined;
    };
  }) => {
    try {
      const nodeId = id
      const targetElm = document.getElementById(nodeId)
      if (!!targetElm) {
        // console.log(targetElm)
        if (!!__timeout) clearTimeout(__timeout)
        __timeout = setTimeout(() => {
          const defaultLogic = () => {
            const curHeight = targetElm.getBoundingClientRect().height
            if (curHeight <= elementHeightCritery) {
              // NOTE: v1 Скроллить до середины контента
              targetElm?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
            } else {
              // NOTE: Скроллить в начало контента
              const elementPosition = targetElm.getBoundingClientRect().top
              const offsetPosition = elementPosition + window.pageYOffset - offsetTop

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
              })
            }
          }
          switch (true) {
            case !!_cfg: {
              const elementPosition = targetElm.getBoundingClientRect().top
              const specialOffsetTop = _cfg.getOffsetTop({ targetElm })
              if (typeof specialOffsetTop === 'number') {
                console.log(`specialOffsetTop -> ${specialOffsetTop} (${typeof specialOffsetTop})`)
                const offsetPosition = elementPosition + window.pageYOffset - specialOffsetTop
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                })
              } else defaultLogic()
              break
            }
            default:
              defaultLogic()
              break
          }

        }, timeout)

      }
      else
        console.log(`- node not found nodeId=${id}`)
    } catch (err) {
      console.warn(err)
    }
  }
}
