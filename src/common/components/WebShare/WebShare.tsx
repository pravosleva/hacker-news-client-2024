/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback } from 'react'
import { RWebShare } from 'react-web-share'
import { Button } from '@mui/material'
import { memo } from 'react'
import ShareIcon from '@mui/icons-material/Share'

type TProps = {
  url: string;
  title?: string;
  text?: string;
  className?: string;
}

export const WebShare = memo(({ url, title = '', text = '' }: TProps) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  }, [])
  return (
    // @ts-ignore
    <RWebShare
      // @ts-ignore
      data={{
        url,
        title,
        text,
      }}
    // @ts-ignore
    // onClick={() => console.log("shared successfully!")}
    // onClick={onBeforeClick}
    >
      <Button
        variant='text'
        endIcon={<ShareIcon />}
        size='small'
        onClick={handleClick}
      >
        Share
      </Button>
    </RWebShare>
  )
})
