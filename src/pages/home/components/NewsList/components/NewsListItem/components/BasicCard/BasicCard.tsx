/* eslint-disable no-extra-boolean-cast */
import { useLayoutEffect, useState } from 'react'
import { Alert, Button, Card, CardContent, CardActions } from '@mui/material'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { getNormalizedDateTime } from '~/common/utils/time-ops'
import { useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import classes from './BasicCard.module.scss'

type TProps = {
  id: number;
  title: string;
  rating: number;
  publishUnixTime: number;
  author: string;
  errorMessage?: string;
  localLink: string;
}

export const BasicCard = ({
  id,
  title,
  rating,
  publishUnixTime,
  author,
  errorMessage,
  localLink,
}: TProps) => {
  // -- NOTE: 2/2 Совершенно необязательный механизм,
  // просто интуитивный UX
  // TODO: Перенести в отдельный контекст
  const [isActive, setIsActive] = useState(false)
  const [urlSearchParams] = useSearchParams()
  useLayoutEffect(() => {
    const idToScroll = urlSearchParams.get('lastSeen')
    setIsActive(idToScroll === String(id))
  }, [urlSearchParams, id, setIsActive])
  // --
  
  return (
    <Card
      id={String(id)}
      sx={{
        // minWidth: 275,
        boxShadow: 'none',
        border: '2px solid lightgray',
        borderRadius: '16px',
        padding: '8px',
      }}
      className={clsx(
        classes.transition,
        {
          [classes.isActive]: isActive,
        },
      )}
    >
      <CardContent
        sx={{
          padding: '8px',
          // border: '1px solid red',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          <Typography gutterBottom sx={{ color: 'text.primary' }}>
            {title}
          </Typography>
          <b>{rating}</b>
        </div>
        <Typography gutterBottom variant="body2" sx={{ color: 'text.secondary' }}>
          by {author}
        </Typography>
        {
          !!errorMessage && (
            <Alert
              title='ERR'
              variant='outlined'
              severity='error'
            >
              {errorMessage}
            </Alert>
          )
        }
      </CardContent>
      <CardActions
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link to={localLink}>
          <Button
            variant='contained'
            endIcon={<ArrowForwardIcon />}
            size='small'
            color={isActive ? 'secondary' : 'primary'}
          >
            Read
          </Button>
        </Link>
        <small style={{ textAlign: 'right' }}>{getNormalizedDateTime(publishUnixTime)}</small>
      </CardActions>
    </Card>
  );
}
