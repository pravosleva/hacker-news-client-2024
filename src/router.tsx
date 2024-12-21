import { createHashRouter } from 'react-router-dom'
import { HomePage, NewsItemPage } from '~/pages'

export const router = createHashRouter(
  [
    {
      path: '/',
      element: <HomePage />,
    },
    {
      path: '/news/:id',
      element: <NewsItemPage />,
    },
  ]
)
