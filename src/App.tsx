import CssBaseline from '@mui/material/CssBaseline'
import { RouterProvider } from 'react-router-dom'
import { memo } from 'react'
import { DocumentTitleUpdateLogic, MainNewsListUpdateLogic } from '~/common/context'
import { router } from './router'

export const App = memo(() => {
  return (
    <>
      <CssBaseline />
      <MainNewsListUpdateLogic>
        <DocumentTitleUpdateLogic>
          <RouterProvider router={router} />
        </DocumentTitleUpdateLogic>
      </MainNewsListUpdateLogic>
    </>
  )
})
