import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ServicesProvider } from '../app/ServicesProvider'
import type { FormsApi } from '../app/TemplateForms'
import type { FormSummary, FormView } from '../domain/types'
import type { PreviewRenderer } from '../preview/types'
import FormPage from '../pages/FormPage'
import LibraryPage from '../pages/LibraryPage'
import PreviewPage from '../pages/PreviewPage'
import { previewStorageKey } from '../pages/previewStorage'

const summary: FormSummary = {
  route: 'abc123',
  displayName: 'Employment contract',
  originalFilename: 'contract.docx',
  format: 'docx',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const view: FormView = {
  ...summary,
  definition: {
    route: 'abc123',
    format: 'docx',
    fields: [
      { label: 'Name', kind: 'text' },
      { label: 'Bio', kind: 'textarea' },
      { label: 'Country', kind: 'select', options: ['Spain', 'France'] },
    ],
  },
}

const fakePreview: PreviewRenderer = {
  render: async () => ({ kind: 'unavailable', reason: 'not under test' }),
}

function makeForms(overrides: Partial<FormsApi> = {}): FormsApi {
  const base: FormsApi = {
    ingest: async () => ({ ok: false, errors: [] }),
    list: async () => [],
    get: async () => null,
    rename: async () => undefined,
    remove: async () => undefined,
    fill: async () => ({
      bytes: new Uint8Array([1]),
      filename: 'contract-filled.docx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }),
    exportPackage: async () => ({
      blob: new Blob(['{}']),
      filename: 'contract.formpack.json',
    }),
    importPackage: async () => ({ ok: false, errors: [] }),
  }
  return { ...base, ...overrides }
}

function renderFormPage(forms: FormsApi, entry = '/f/abc123') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <ServicesProvider value={{ forms, preview: fakePreview }}>
        <Routes>
          <Route path="/f/:route" element={<FormPage />} />
        </Routes>
      </ServicesProvider>
    </MemoryRouter>,
  )
}

describe('LibraryPage', () => {
  it('lists stored forms and offers upload and import', async () => {
    render(
      <MemoryRouter>
        <ServicesProvider
          value={{ forms: makeForms({ list: async () => [summary] }), preview: fakePreview }}
        >
          <LibraryPage />
        </ServicesProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Employment contract')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload template/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import package/i })).toBeInTheDocument()
  })
})

describe('FormPage', () => {
  beforeEach(() => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
  })

  it('renders the three field kinds in document order', async () => {
    renderFormPage(makeForms({ get: async () => view }))

    expect(await screen.findByLabelText('Name')).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Bio').tagName).toBe('TEXTAREA')
    const select = screen.getByLabelText('Country')
    expect(select.tagName).toBe('SELECT')
    expect(screen.getByRole('option', { name: 'Spain' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'France' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Choose…' })).toBeInTheDocument()
  })

  it('fills answers and downloads the filled document', async () => {
    const fill = vi.fn<FormsApi['fill']>(async () => ({
      bytes: new Uint8Array([1]),
      filename: 'contract-filled.docx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }))
    renderFormPage(makeForms({ get: async () => view, fill }))

    await userEvent.type(await screen.findByLabelText('Name'), 'Ada')
    await userEvent.type(screen.getByLabelText('Bio'), 'Hello')
    await userEvent.selectOptions(screen.getByLabelText('Country'), 'France')
    await userEvent.click(
      screen.getByRole('button', { name: /download filled document/i }),
    )

    await waitFor(() => expect(fill).toHaveBeenCalledTimes(1))
    const [, answers] = fill.mock.calls[0]
    expect(answers.get('Name')).toBe('Ada')
    expect(answers.get('Bio')).toBe('Hello')
    expect(answers.get('Country')).toBe('France')
  })

  it('shows the read-only detected-fields screen after upload', async () => {
    renderFormPage(makeForms({ get: async () => view }), '/f/abc123?detected=1')

    expect(await screen.findByText('Detected fields')).toBeInTheDocument()
    expect(screen.getByText('Spain · France')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open form/i })).toBeInTheDocument()
  })

  it('explains an unknown route', async () => {
    renderFormPage(makeForms({ get: async () => null }))

    expect(
      await screen.findByText('Form not found on this device'),
    ).toBeInTheDocument()
  })
})

describe('PreviewPage', () => {
  it('renders a sandboxed iframe without allowing same-origin access', async () => {
    sessionStorage.setItem(
      previewStorageKey('abc123'),
      JSON.stringify([['Name', 'Ada']]),
    )
    const preview: PreviewRenderer = {
      render: async () => ({
        kind: 'html',
        html: '<!doctype html><html><body>Preview</body></html>',
      }),
    }

    render(
      <MemoryRouter initialEntries={['/f/abc123/preview']}>
        <ServicesProvider
          value={{ forms: makeForms({ get: async () => view }), preview }}
        >
          <Routes>
            <Route path="/f/:route/preview" element={<PreviewPage />} />
          </Routes>
        </ServicesProvider>
      </MemoryRouter>,
    )

    const frame = await screen.findByTitle('Approximate preview')
    expect(frame.tagName).toBe('IFRAME')
    expect(frame).toHaveAttribute('sandbox', 'allow-scripts')
  })
})
