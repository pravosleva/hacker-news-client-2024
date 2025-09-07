import { memo } from 'react'
import { Chip } from '@mui/material'
import _Countdown, { zeroPad } from 'react-countdown'

enum EDeadLine {
  WARN = 2,
  DANGER = 1,
}
const deadlineConfig = {
  [EDeadLine.WARN]: 'default',
  [EDeadLine.DANGER]: 'warning',
}

const CountdownRenderer = ({ minutes, seconds, completed }: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}) => {
  if (completed) return null

  return (
    <Chip
      variant='filled'
      size='small'
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      color={
        minutes <= EDeadLine.DANGER
        ? deadlineConfig[EDeadLine.DANGER]
        : minutes <= EDeadLine.WARN
          ? deadlineConfig[EDeadLine.WARN]
          : 'success'
      }
      label={`${zeroPad(minutes)}:${zeroPad(seconds)}`}
    />
  )
}


export const Countdown = ({ targetDate }: { targetDate: number }) => {
  return (
    <_Countdown
      renderer={CountdownRenderer}
      date={targetDate}
    />
  )
}