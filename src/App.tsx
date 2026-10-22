import { lazy, Suspense } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { useI18n } from './i18n/context'
import { INTERFACE_LOCALES, LANGUAGE_NAMES } from './i18n/locales'
import { ErrorBoundary } from './ui/ErrorBoundary'
import FormPage from './pages/FormPage'
import LibraryPage from './pages/LibraryPage'
import NotFoundPage from './pages/NotFoundPage'
import PreviewPage from './pages/PreviewPage'
import UnexpectedErrorPage from './pages/UnexpectedErrorPage'

const DocsPage = lazy(() => import('./pages/DocsPage'))

function isLibraryRoute(pathname: string): boolean {
  return pathname === '/'
}

function isFormRoute(pathname: string): boolean {
  return pathname.startsWith('/f/')
}

function isDocsRoute(pathname: string): boolean {
  return pathname === '/docs'
}

export default function App() {
  const { locale, setLocale, messages } = useI18n()
  const { pathname } = useLocation()
  const libraryActive = isLibraryRoute(pathname)
  const formsActive = libraryActive || isFormRoute(pathname)
  const docsActive = isDocsRoute(pathname)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-content content-column">
          <Link to="/" className="brand">
            {messages.appName}
          </Link>
          <nav className="app-nav">
            <Link
              to="/"
              className={formsActive ? 'active' : undefined}
              aria-current={
                libraryActive ? 'page' : formsActive ? 'true' : undefined
              }
            >
              {messages.formsNav}
            </Link>
            <Link
              to="/docs"
              className={docsActive ? 'active' : undefined}
              aria-current={docsActive ? 'page' : undefined}
            >
              {messages.docs}
            </Link>
          </nav>
          <div
            className="interface-language-switcher"
            role="group"
            aria-label={messages.interfaceLanguage}
          >
            {INTERFACE_LOCALES.map((value) => (
              <button
                key={value}
                type="button"
                className="interface-language-button"
                lang={value}
                aria-pressed={value === locale}
                aria-label={`${value} — ${LANGUAGE_NAMES[value]}`}
                onClick={() => setLocale(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className="app-main content-column">
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
