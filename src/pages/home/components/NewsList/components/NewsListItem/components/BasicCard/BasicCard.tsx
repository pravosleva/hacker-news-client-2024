import { useLayoutEffect, useMemo, useState } from 'react'
import { Button, Card, Chip, CardContent, CardActions } from '@mui/material'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { getNormalizedDateTime } from '~/common/utils/time-ops'
import { useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import classes from './BasicCard.module.scss'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import baseClasses from '~/App.module.scss'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import { useSelector } from 'react-redux'
import { TStore } from '~/common/store'

type TProps = {
  id: number;
  title: string;
  rating: number;
  publishUnixTime: number;
  author: string;
  errorMessage?: string;
  localLink: string;
  isNew?: boolean;
}

export const BasicCard = ({
  id,
  title,
  rating,
  publishUnixTime,
  author,
  errorMessage,
  localLink,
  isNew,
}: TProps) => {
  // -- NOTE: 2/3 Совершенно необязательный механизм,
  // просто интуитивный UX
  // TODO: Можно перенести в отдельный контекст
  const [isLastSeen, setIsLastSeen] = useState(false)
  const [urlSearchParams] = useSearchParams()
  useLayoutEffect(() => {
    const idToScroll = urlSearchParams.get('lastSeen')
    setIsLastSeen(idToScroll === String(id))
  }, [urlSearchParams, id, setIsLastSeen])
  // --

  const favoritesIds = useSelector((s: TStore) => s.news.persistedFavorites)
  const isFavorite = useMemo(() => favoritesIds.includes(Number(id)), [favoritesIds, id])
  
  return (
    <Card
      id={String(id)}
      sx={{
        boxShadow: 'none',
        border: '2px solid lightgray',
        borderRadius: '16px',
        padding: '8px',
        position: 'relative',
      }}
      className={clsx(
        classes.transition,
        {
          [classes.isRotated]: isLastSeen,
        },
      )}
    >
      <CardContent sx={{ padding: '8px' }}>
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
            <Chip className={baseClasses.truncate} label={`Item Error: ${errorMessage}`} size='small' color='error' />
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
            endIcon={
              isFavorite
              ? <BookmarkIcon />
              : isNew
                ? <NewReleasesIcon />
                : <ArrowForwardIcon />}
            size='small'
            color={
              isLastSeen
              ? 'secondary'
              : 'primary'
            }
          >
            Read
          </Button>
        </Link>
        <small style={{ textAlign: 'right' }}>{getNormalizedDateTime(publishUnixTime)}</small>
      </CardActions>
    </Card>
  );
}
