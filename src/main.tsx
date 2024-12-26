// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '~/common/store'
import { App } from './App'
// import { PersistGate } from 'redux-persist/integration/react'

createRoot(document.getElementById('root')!).render(
  <>
    <Provider store={store}>
      <App />
    </Provider>
  </>,
)
