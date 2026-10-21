import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../i18n/I18nProvider'
import type { InterfaceLocale } from '../i18n/locales'
import DocsPage from '../pages/DocsPage'

function renderDocs(locale: InterfaceLocale) {
  return render(
    <MemoryRouter>
      <I18nProvider initialLocale={locale}>
        <DocsPage />
      </I18nProvider>
    </MemoryRouter>,
  )
}

describe('DocsPage', () => {
  it.each([
    ['en', 'Docform guide', 'What you need'],
    ['es', 'Guía de Docform', 'Qué necesitas'],
    ['eu', 'Docform gida', 'Zer behar duzu'],
  ] as const)('renders the %s guide from markdown', (locale, title, section) => {
    renderDocs(locale)

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: section })).toBeInTheDocument()
  })

  it('renders markdown tables and placeholder syntax', () => {
    renderDocs('en')

    expect(screen.getByText('A long text answer')).toBeInTheDocument()
    expect(screen.getByText('{{Notes|textarea}}')).toBeInTheDocument()
  })
})
