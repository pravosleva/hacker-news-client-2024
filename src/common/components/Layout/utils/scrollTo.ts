const scrollToRef = (ref: React.RefObject<HTMLElement>, headerPx: number = 0, additionalPx: number = 0, noAnimation?: boolean) => {
  if (!!ref?.current && !!window) {
    // ref.current.scrollIntoView()
    window.scrollTo({
      left: 0,
      behavior: noAnimation ? 'auto' : 'smooth',
      top: ref.current.offsetTop - headerPx - additionalPx,
    })
  }
}
export const scrollTo = (ref: React.RefObject<HTMLElement>, noAnimation?: boolean) => {
  scrollToRef(ref, 37, 65, noAnimation)
}
export const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
export const scrollTopExtra = () => {
  window.scrollTo({ top: 0, behavior: 'auto' })
}
export const scrollToElm = (elm: HTMLElement) => {
  elm.scrollTo({ top: 0, behavior: 'smooth' })
}
