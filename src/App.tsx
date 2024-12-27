import CssBaseline from '@mui/material/CssBaseline'
import { RouterProvider } from 'react-router-dom'
import { memo } from 'react'
import { TopLevelLogic } from '~/common/context/TopLevelLogic'
import { router } from './router'

export const App = memo(() => {
  return (
    <>
      <CssBaseline />
      <TopLevelLogic>
        <RouterProvider router={router} />
      </TopLevelLogic>
    </>
  )
})
