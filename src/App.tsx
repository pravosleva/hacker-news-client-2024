import CssBaseline from '@mui/material/CssBaseline'
import { RouterProvider } from 'react-router-dom'
import { memo } from 'react'
import { DocumentTitleUpdateLogic, MainNewsListUpdateLogic } from '~/common/context'
import { router } from './router'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from './common/components/ui-kit'

export const App = memo(() => {
  return (
    <>
      <CssBaseline />
      <MainNewsListUpdateLogic>
        <DocumentTitleUpdateLogic>
          <ThemeProvider theme={theme}>
            <RouterProvider router={router} />
          </ThemeProvider>
        </DocumentTitleUpdateLogic>
      </MainNewsListUpdateLogic>
    </>
  )
})
