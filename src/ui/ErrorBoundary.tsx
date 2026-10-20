import { Component } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { strings } from '../strings'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="page">
          <h1>{strings.errorTitle}</h1>
          <p className="muted">{strings.errorBody}</p>
          <Link className="button-link" to="/">
            {strings.backToLibrary}
          </Link>
        </section>
      )
    }
    return this.props.children
  }
}
