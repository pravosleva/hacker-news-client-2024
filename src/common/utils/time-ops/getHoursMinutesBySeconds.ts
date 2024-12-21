import { getZero } from './getZero'

// 18:15
export const getHoursMinutesBySeconds = (date: string | number) => {
  // const dt = new Date(sec * 10 ** 3)
  const dt = new Date(date)
  const hr = getZero(dt.getHours())
  const min = getZero(dt.getMinutes())

  return `${hr}:${min}`
}
