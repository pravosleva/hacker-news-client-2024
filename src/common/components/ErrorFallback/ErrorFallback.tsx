import { Alert, Button } from '@mui/material'
import { styled } from '@mui/material/styles'

type TProps = {
  resetErrorBoundary: () => void;
  error: Error;
  customPossibleReason?: string;
}

const PREFIX = 'MyCard';
const classes = {
  root: `${PREFIX}-root`,
  cta: `${PREFIX}-cta`,
  content: `${PREFIX}-content`,
}
const CustomAlert = styled(Alert)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: 'flex',
    alignItems: 'center',
    '& > *:first-child': {
      marginRight: theme.spacing(2)
    },
    backgroundColor: theme.palette.primary.main
  },
  // [`& .${classes.cta}`]: {
  //   borderRadius: theme.shape.radius
  // },
  [`& .${classes.content}`]: {
    color: theme.palette.common.white,
    fontSize: 16,
    lineHeight: 1.7
  },
}))

export const ErrorFallback = ({ error, resetErrorBoundary, customPossibleReason }: TProps) => {
  // const classes = useStyles()
  const { message } = error

  return (
    <CustomAlert variant="outlined" severity="error" title="Oops">
      <div className={classes.root}>
        {!!customPossibleReason && <div>{customPossibleReason}</div>}
        <div>{message}</div>
        <Button size='small' autoFocus onClick={resetErrorBoundary} variant='outlined' color="primary">
          Try again
        </Button>
      </div>
    </CustomAlert>
  )
}
