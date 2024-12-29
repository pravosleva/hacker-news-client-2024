import __TimeAgo from 'javascript-time-ago'

import en from 'javascript-time-ago/locale/en'
import ru from 'javascript-time-ago/locale/ru'

import { memo } from 'react'
import ReactTimeAgo from 'react-time-ago'

__TimeAgo.addDefaultLocale(en)
__TimeAgo.addLocale(ru)

const timeAgo = new __TimeAgo('en-US')

type TProps = {
  date: number | Date;
  renderer: ({ verboseDate, children }: {
    date: Date;
    verboseDate: string;
    tooltip: string;
    children: React.ReactNode;
  }) => React.ReactNode;
}

const _TimeAgo = memo(({ date, renderer }: TProps) => {
  return (
    <ReactTimeAgo
      date={date}
      locale='en-US'
      component={(ps) => renderer({ ...ps })}
    />
  )
})

export const TimeAgo = memo(({ date, prefix }: {
  date: number | Date;
  prefix: string;
}) => {
  return (
    <_TimeAgo
      date={date}
      renderer={({ date }) => (
        <em style={{ fontSize: 'small' }}>{prefix} {timeAgo.format(date)}</em>
      )}
    />
  )
})
