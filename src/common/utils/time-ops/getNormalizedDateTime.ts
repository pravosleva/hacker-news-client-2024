import { getNormalizedDate } from './getNormalizeDate'
import { getHoursMinutesBySeconds } from './getHoursMinutesBySeconds'

// 09.11.2020 18:15:45
export const getNormalizedDateTime = (sec: number) => {
  const modifiedDate = sec * 10 ** 3
  const dt = new Date(modifiedDate)
  // const dt = new Date(date)
  const seconds = dt.getSeconds()

  return `${getNormalizedDate(modifiedDate)} ${getHoursMinutesBySeconds(modifiedDate)}:${seconds}`
}
