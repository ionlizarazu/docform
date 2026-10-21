import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { useI18n } from './i18n/context'
import {
  INTERFACE_LOCALES,
  LANGUAGE_NAMES,
  isInterfaceLocale,
} from './i18n/locales'
import { ErrorBoundary } from './ui/ErrorBoundary'
import FormPage from './pages/FormPage'
import LibraryPage from './pages/LibraryPage'
import NotFoundPage from './pages/NotFoundPage'
import PreviewPage from './pages/PreviewPage'
import UnexpectedErrorPage from './pages/UnexpectedErrorPage'

const DocsPage = lazy(() => import('./pages/DocsPage'))

export default function App() {
  const { locale, setLocale, messages } = useI18n()

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          {messages.appName}
        </Link>
        <p className="tagline">{messages.appTagline}</p>
        <Link to="/docs" className="docs-link">
          {messages.docs}
        </Link>
        <label className="interface-language">
          <span>{messages.interfaceLanguage}</span>
          <select
            value={locale}
            onChange={(event) => {
              const next = event.target.value
              if (isInterfaceLocale(next)) {
                setLocale(next)
              }
            }}
          >
            {INTERFACE_LOCALES.map((value) => (
              <option key={value} value={value} lang={value}>
                {LANGUAGE_NAMES[value]}
              </option>
            ))}
          </select>
        </label>
      </header>
      <main className="app-main">
        <ErrorBoundary fallback={<UnexpectedErrorPage />}>
          <Routes>
            <Route path="/" element={<LibraryPage />} />
            <Route
              path="/docs"
              element={
                <Suspense fallback={<p className="muted">{messages.loading}</p>}>
                  <DocsPage />
                </Suspense>
              }
            />
            <Route path="/f/:route" element={<FormPage />} />
            <Route path="/f/:route/preview" element={<PreviewPage />} />
            <Route
              path="*"
              element={
                <NotFoundPage
                  title={messages.unknownRouteTitle}
                  body={messages.unknownRouteBody}
                />
              }
            />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  )
}
