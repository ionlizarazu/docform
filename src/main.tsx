import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { routerBasename } from './app/routerBase'
import { I18nProvider } from './i18n/I18nProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <BrowserRouter basename={routerBasename(import.meta.env.BASE_URL)}>
        <App />
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>,
)
