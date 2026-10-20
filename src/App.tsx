import { Link, Route, Routes } from 'react-router-dom'
import { strings } from './strings'
import { ErrorBoundary } from './ui/ErrorBoundary'
import FormPage from './pages/FormPage'
import LibraryPage from './pages/LibraryPage'
import NotFoundPage from './pages/NotFoundPage'
import PreviewPage from './pages/PreviewPage'

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          {strings.appName}
        </Link>
        <p className="tagline">{strings.appTagline}</p>
      </header>
      <main className="app-main">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LibraryPage />} />
            <Route path="/f/:route" element={<FormPage />} />
            <Route path="/f/:route/preview" element={<PreviewPage />} />
            <Route
              path="*"
              element={
                <NotFoundPage
                  title={strings.unknownRouteTitle}
                  body={strings.unknownRouteBody}
                />
              }
            />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  )
}
