import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { ServicesProvider } from '../app/ServicesProvider'
import type { FormsApi } from '../app/TemplateForms'
import { TemplateFormError } from '../domain/types'
import type { FormSummary, FormView } from '../domain/types'
import { I18nProvider } from '../i18n/I18nProvider'
import { INTERFACE_LOCALE_STORAGE_KEY } from '../i18n/locales'
import type { InterfaceLocale } from '../i18n/locales'
import type { PreviewRenderer } from '../preview/types'
import FormPage from '../pages/FormPage'
import LibraryPage from '../pages/LibraryPage'
import PreviewPage from '../pages/PreviewPage'
import UnexpectedErrorPage from '../pages/UnexpectedErrorPage'
import { previewStorageKey } from '../pages/previewStorage'

const summary: FormSummary = {
  route: 'abc123',
  displayName: 'Employment contract',
  originalFilename: 'contract.en.docx',
  primaryLocale: 'en',
  locales: ['en', 'es'],
  variantCount: 2,
  createdAt: '2026-01-01T00:00:00.000Z',
}

const summarySingle: FormSummary = {
  ...summary,
  route: 'def456',
  displayName: 'Legacy contract',
  primaryLocale: 'und',
  locales: ['und'],
  variantCount: 1,
}

const viewSingle: FormView = {
  ...summary,
  route: 'ghi789',
  displayName: 'Legacy contract',
  originalFilename: 'legacy.docx',
  primaryLocale: 'und',
  locales: ['und'],
  variantCount: 1,
  definition: {
    route: 'ghi789',
    primaryLocale: 'und',
    variants: [
      {
        locale: 'und',
        format: 'docx',
        templateHash: 'c'.repeat(64),
        fields: [{ label: 'Name', kind: 'text' }],
      },
    ],
  },
}

const view: FormView = {
  ...summary,
  definition: {
    route: 'abc123',
    primaryLocale: 'en',
    variants: [
      {
        locale: 'en',
        format: 'docx',
        templateHash: 'a'.repeat(64),
        fields: [
          { label: 'Name', kind: 'text' },
          { label: 'Bio', kind: 'textarea' },
          { label: 'Country', kind: 'select', options: ['Spain', 'France'] },
        ],
      },
      {
        locale: 'es',
        format: 'odt',
        templateHash: 'b'.repeat(64),
        fields: [
          { label: 'Name', kind: 'text' },
          { label: 'Bio', kind: 'textarea' },
          { label: 'Country', kind: 'select', options: ['España', 'Francia'] },
        ],
      },
    ],
  },
}

const filledSet = {
  documents: [
    {
      bytes: new Uint8Array([1]),
      filename: 'contract-en-filled.docx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      format: 'docx' as const,
      locale: 'en',
    },
    {
      bytes: new Uint8Array([2]),
      filename: 'contract-es-filled.odt',
      mimeType: 'application/vnd.oasis.opendocument.text',
      format: 'odt' as const,
      locale: 'es',
    },
  ],
  zip: { blob: new Blob(['zip']), filename: 'contract.zip' },
}

const fakePreview: PreviewRenderer = {
  render: async () => ({ kind: 'unavailable', reason: 'not under test' }),
}

function makeForms(overrides: Partial<FormsApi> = {}): FormsApi {
  const base: FormsApi = {
    ingest: async () => ({ ok: false, errors: [] }),
    ingestVariants: async () => ({ ok: false, errors: [] }),
    list: async () => [],
    get: async () => null,
    rename: async () => undefined,
    remove: async () => undefined,
    fill: async () => filledSet,
    exportPackage: async () => ({
      blob: new Blob(['{}']),
      filename: 'contract.formpack.json',
    }),
    importPackage: async () => ({ ok: false, errors: [] }),
  }
  return { ...base, ...overrides }
}

function renderFormPage(
  forms: FormsApi,
  entry = '/f/abc123',
  locale: InterfaceLocale = 'en',
) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <I18nProvider initialLocale={locale}>
        <ServicesProvider value={{ forms, preview: fakePreview }}>
          <Routes>
            <Route path="/f/:route" element={<FormPage />} />
          </Routes>
        </ServicesProvider>
      </I18nProvider>
    </MemoryRouter>,
  )
}

describe('LibraryPage', () => {
  it('lists stored forms and offers upload and import', async () => {
    render(
      <MemoryRouter>
        <I18nProvider initialLocale="en">
          <ServicesProvider
            value={{
              forms: makeForms({ list: async () => [summary] }),
              preview: fakePreview,
            }}
          >
            <LibraryPage />
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Employment contract')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new form/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import package/i })).toBeInTheDocument()
    expect(screen.getByText('2 languages')).toBeInTheDocument()
  })

  it('opens the bilingual new-form panel', async () => {
    render(
      <MemoryRouter>
        <I18nProvider initialLocale="en">
          <ServicesProvider value={{ forms: makeForms(), preview: fakePreview }}>
            <LibraryPage />
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: /new form/i }))
    expect(screen.getByLabelText('Template 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Template 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Document language 1')).toHaveValue('en')
    expect(screen.getByLabelText('Document language 2')).toHaveValue('es')
    expect(screen.getByRole('button', { name: /create form/i })).toBeInTheDocument()
  })

  it('localizes package import failures and hides the raw diagnostic', async () => {
    const { container } = render(
      <MemoryRouter>
        <I18nProvider initialLocale="es">
          <ServicesProvider
            value={{
              forms: makeForms({
                importPackage: async () => ({
                  ok: false,
                  errors: [
                    {
                      code: 'invalid-package',
                      detail: 'route-mismatch',
                      message: 'raw diagnostic',
                    },
                  ],
                }),
              }),
              preview: fakePreview,
            }}
          >
            <LibraryPage />
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    const input = container.querySelector(
      'input[type=file][accept*="json"]',
    ) as HTMLInputElement
    await userEvent.upload(
      input,
      new File(['{}'], 'bad.formpack.json', { type: 'application/json' }),
    )

    expect(
      await screen.findByText(
        'La ruta del paquete no coincide con su contenido.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('raw diagnostic')).not.toBeInTheDocument()
  })

  it('localizes the delete confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(
      <MemoryRouter>
        <I18nProvider initialLocale="es">
          <ServicesProvider
            value={{
              forms: makeForms({ list: async () => [summary] }),
              preview: fakePreview,
            }}
          >
            <LibraryPage />
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    await userEvent.click(
      await screen.findByRole('button', { name: 'Eliminar' }),
    )

    expect(confirm).toHaveBeenCalledWith(
      '¿Eliminar este formulario? Se eliminarán sus plantillas y su ruta.',
    )
  })

  it('localizes library list failures', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(
      <MemoryRouter>
        <I18nProvider initialLocale="es">
          <ServicesProvider
            value={{
              forms: makeForms({
                list: async () => {
                  throw new Error('raw diagnostic')
                },
              }),
              preview: fakePreview,
            }}
          >
            <LibraryPage />
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByText('Inténtalo de nuevo.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('raw diagnostic')).not.toBeInTheDocument()
  })

  it('localizes rename failures in Basque', async () => {
    render(
      <MemoryRouter>
        <I18nProvider initialLocale="eu">
          <ServicesProvider
            value={{
              forms: makeForms({
                list: async () => [summary],
                rename: async () => {
                  throw new TemplateFormError('not-found', 'raw diagnostic')
                },
              }),
              preview: fakePreview,
            }}
          >
            <LibraryPage />
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    await userEvent.click(
      await screen.findByRole('button', { name: 'Izena aldatu' }),
    )
    const name = screen.getByLabelText('Formularioaren izena')
    await userEvent.clear(name)
    await userEvent.type(name, 'Berria')
    await userEvent.click(screen.getByRole('button', { name: 'Gorde' }))

    expect(
      await screen.findByText(
        'Formulario hau ez dago gailu honetan gordeta.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('raw diagnostic')).not.toBeInTheDocument()
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
    const fill = vi.fn<FormsApi['fill']>(async () => filledSet)
    renderFormPage(makeForms({ get: async () => view, fill }))

    await userEvent.type(await screen.findByLabelText('Name'), 'Ada')
    await userEvent.type(screen.getByLabelText('Bio'), 'Hello')
    await userEvent.selectOptions(screen.getByLabelText('Country'), 'France')
    await userEvent.click(
      screen.getByRole('button', { name: /download filled documents/i }),
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
    expect(screen.getByText('España · Francia')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open form/i })).toBeInTheDocument()
  })

  it('localizes the detected screen and tags template text with its language', async () => {
    renderFormPage(
      makeForms({ get: async () => view }),
      '/f/abc123?detected=1',
      'es',
    )

    expect(
      await screen.findByRole('heading', { name: 'Campos detectados' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Variantes de idioma')).toBeInTheDocument()
    expect(screen.getByText('Name')).toHaveAttribute('lang', 'en')
    expect(screen.getByText('España · Francia')).toHaveAttribute('lang', 'es')
    expect(screen.getByText('Texto')).toBeInTheDocument()
    expect(screen.getByText('Selección')).toBeInTheDocument()
    expect(screen.getByText('Idioma principal')).toBeInTheDocument()
  })

  it('localizes the detected screen in Basque', async () => {
    renderFormPage(
      makeForms({ get: async () => view }),
      '/f/abc123?detected=1',
      'eu',
    )

    expect(
      await screen.findByRole('heading', { name: 'Detektatutako eremuak' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Hizkuntza-aldaerak')).toBeInTheDocument()
    expect(screen.getByText('Testua')).toBeInTheDocument()
    expect(screen.getByText('Hautaketa')).toBeInTheDocument()
  })

  it('explains an unknown route', async () => {
    renderFormPage(makeForms({ get: async () => null }))

    expect(
      await screen.findByText('Form not found on this device'),
    ).toBeInTheDocument()
  })

  it('localizes the form page while keeping template labels in the document language', async () => {
    renderFormPage(makeForms({ get: async () => view }), '/f/abc123', 'es')

    expect(
      await screen.findByText('Todos los campos son opcionales.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Name')).toHaveAttribute('lang', 'en')
    expect(screen.getByRole('option', { name: 'Elige…' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Descargar documentos rellenos' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Vista previa' }),
    ).toBeInTheDocument()
  })

  it('localizes form actions in Basque', async () => {
    renderFormPage(makeForms({ get: async () => view }), '/f/abc123', 'eu')

    expect(
      await screen.findByText('Eremu guztiak hautazkoak dira.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Deskargatu betetako dokumentuak' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Aurrebista' }),
    ).toBeInTheDocument()
  })

  it('omits the document lang when the primary locale is undetermined', async () => {
    renderFormPage(
      makeForms({ get: async () => viewSingle }),
      '/f/ghi789',
      'es',
    )

    expect(await screen.findByText('Name')).not.toHaveAttribute('lang')
  })

  it('preserves answers when the interface language changes', async () => {
    render(
      <MemoryRouter initialEntries={['/f/abc123']}>
        <I18nProvider initialLocale="en">
          <ServicesProvider
            value={{ forms: makeForms({ get: async () => view }), preview: fakePreview }}
          >
            <App />
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    await userEvent.type(await screen.findByLabelText('Name'), 'Ada')
    await userEvent.selectOptions(screen.getByLabelText('Country'), 'France')
    await userEvent.selectOptions(
      screen.getByLabelText('Interface language'),
      'es',
    )

    expect(screen.getByLabelText('Name')).toHaveValue('Ada')
    expect(screen.getByLabelText('Country')).toHaveValue('France')
    expect(
      screen.getByText('Todos los campos son opcionales.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Name')).toHaveAttribute('lang', 'en')
  })

  it('localizes the unsaved-answer warning', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderFormPage(makeForms({ get: async () => view }), '/f/abc123', 'es')

    await userEvent.type(await screen.findByLabelText('Name'), 'Ada')
    await userEvent.click(
      screen.getByRole('link', { name: 'Volver a los formularios' }),
    )

    expect(confirm).toHaveBeenCalledWith(
      'Tienes respuestas sin guardar. ¿Salir de esta página de todos modos?',
    )
  })

  it('localizes the missing-form page', async () => {
    renderFormPage(makeForms({ get: async () => null }), '/f/abc123', 'es')

    expect(
      await screen.findByText('Formulario no encontrado en este dispositivo'),
    ).toBeInTheDocument()
  })

  it('localizes form load failures', async () => {
    renderFormPage(
      makeForms({
        get: async () => {
          throw new TemplateFormError('not-found', 'raw diagnostic', {
            detail: 'not-found',
          })
        },
      }),
      '/f/abc123',
      'es',
    )

    expect(
      await screen.findByText('No se pudo cargar este formulario.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Este formulario no está guardado en este dispositivo.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('raw diagnostic')).not.toBeInTheDocument()
  })

  it('localizes form fill failures', async () => {
    const fill = vi.fn<FormsApi['fill']>(async () => {
      throw new TemplateFormError('invalid-answer', 'raw diagnostic', {
        detail: 'invalid-answer',
        params: { label: 'Country', answer: 'Nope' },
      })
    })
    renderFormPage(
      makeForms({ get: async () => view, fill }),
      '/f/abc123',
      'es',
    )

    await userEvent.type(await screen.findByLabelText('Name'), 'Ada')
    await userEvent.click(
      screen.getByRole('button', { name: 'Descargar documentos rellenos' }),
    )

    expect(
      await screen.findByText('"Nope" no es una opción de "Country".'),
    ).toBeInTheDocument()
    expect(screen.queryByText('raw diagnostic')).not.toBeInTheDocument()
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
        <I18nProvider initialLocale="en">
          <ServicesProvider
            value={{ forms: makeForms({ get: async () => view }), preview }}
          >
            <Routes>
              <Route path="/f/:route/preview" element={<PreviewPage />} />
            </Routes>
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    const frame = await screen.findByTitle('Approximate preview')
    expect(frame.tagName).toBe('IFRAME')
    expect(frame).toHaveAttribute('sandbox', 'allow-scripts')
  })

  it('localizes preview chrome and keeps document-language tabs independent', async () => {
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
        <I18nProvider initialLocale="en">
          <ServicesProvider
            value={{ forms: makeForms({ get: async () => view }), preview }}
          >
            <App />
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    const frame = await screen.findByTitle('Approximate preview')
    expect(frame).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'en' }),
    ).toHaveAttribute('aria-selected', 'true')

    await userEvent.selectOptions(
      screen.getByLabelText('Interface language'),
      'es',
    )

    expect(
      await screen.findByTitle('Vista previa aproximada'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'en' }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByRole('tablist', { name: 'Idiomas de los documentos' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Descargar documentos rellenos' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Imprimir' }),
    ).toBeInTheDocument()
  })

  it('puts the raw preview failure reason behind localized technical details', async () => {
    sessionStorage.setItem(
      previewStorageKey('abc123'),
      JSON.stringify([['Name', 'Ada']]),
    )
    const preview: PreviewRenderer = {
      render: async () => ({
        kind: 'unavailable',
        reason: 'raw engine failure',
      }),
    }

    render(
      <MemoryRouter initialEntries={['/f/abc123/preview']}>
        <I18nProvider initialLocale="es">
          <ServicesProvider
            value={{ forms: makeForms({ get: async () => view }), preview }}
          >
            <Routes>
              <Route path="/f/:route/preview" element={<PreviewPage />} />
            </Routes>
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByText(
        'No se pudo renderizar la vista previa de este documento.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Detalles técnicos')).toBeInTheDocument()
    expect(screen.getByText('raw engine failure')).toBeInTheDocument()
  })

  it('localizes preview chrome in Basque', async () => {
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
        <I18nProvider initialLocale="eu">
          <ServicesProvider
            value={{ forms: makeForms({ get: async () => view }), preview }}
          >
            <Routes>
              <Route path="/f/:route/preview" element={<PreviewPage />} />
            </Routes>
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByTitle('Aurrebista gutxi gorabeherakoa'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tablist', { name: 'Dokumentuen hizkuntzak' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inprimatu' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Deskargatu betetako dokumentuak' }),
    ).toBeInTheDocument()
  })

  it('does not call a form-load failure a preview render failure', async () => {
    render(
      <MemoryRouter initialEntries={['/f/abc123/preview']}>
        <I18nProvider initialLocale="es">
          <ServicesProvider
            value={{
              forms: makeForms({
                get: async () => {
                  throw new TemplateFormError('not-found', 'raw diagnostic', {
                    detail: 'not-found',
                  })
                },
              }),
              preview: fakePreview,
            }}
          >
            <Routes>
              <Route path="/f/:route/preview" element={<PreviewPage />} />
            </Routes>
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'No se pudo completar la acción',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Este formulario no está guardado en este dispositivo.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('raw diagnostic')).not.toBeInTheDocument()
  })

  it('localizes preview fill failures', async () => {
    sessionStorage.setItem(
      previewStorageKey('abc123'),
      JSON.stringify([['Name', 'Ada']]),
    )
    const fill = vi.fn<FormsApi['fill']>(async () => {
      throw new TemplateFormError('invalid-answer', 'raw diagnostic', {
        detail: 'invalid-answer',
        params: { label: 'Name', answer: 'x' },
      })
    })

    render(
      <MemoryRouter initialEntries={['/f/abc123/preview']}>
        <I18nProvider initialLocale="eu">
          <ServicesProvider
            value={{
              forms: makeForms({ get: async () => view, fill }),
              preview: fakePreview,
            }}
          >
            <Routes>
              <Route path="/f/:route/preview" element={<PreviewPage />} />
            </Routes>
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByText('Ezin izan da ekintza osatu'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('"x" ez da "Name" eremuko aukera bat.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('raw diagnostic')).not.toBeInTheDocument()
  })

  it('localizes the no-answers preview state', async () => {
    render(
      <MemoryRouter initialEntries={['/f/abc123/preview']}>
        <I18nProvider initialLocale="es">
          <ServicesProvider
            value={{ forms: makeForms({ get: async () => view }), preview: fakePreview }}
          >
            <Routes>
              <Route path="/f/:route/preview" element={<PreviewPage />} />
            </Routes>
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByText(
        'Rellena el formulario primero para previsualizar un documento.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Volver al formulario' }),
    ).toBeInTheDocument()
  })
})

describe('App shell', () => {
  function renderApp(entry = '/', locale?: InterfaceLocale) {
    return render(
      <MemoryRouter initialEntries={[entry]}>
        <I18nProvider initialLocale={locale}>
          <ServicesProvider value={{ forms: makeForms(), preview: fakePreview }}>
            <App />
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )
  }

  it('switches the interface between Euskara, Español, and English', async () => {
    renderApp('/', 'en')

    expect(screen.getByRole('heading', { name: 'Your forms' })).toBeInTheDocument()
    const select = screen.getByRole('combobox')
    expect(screen.getByRole('option', { name: 'Euskara' })).toHaveAttribute(
      'lang',
      'eu',
    )

    await userEvent.selectOptions(select, 'es')
    expect(screen.getByRole('heading', { name: 'Tus formularios' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('es')

    await userEvent.selectOptions(select, 'eu')
    expect(
      screen.getByRole('heading', { name: 'Zure formularioak' }),
    ).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('eu')
  })

  it('restores the saved interface locale', async () => {
    localStorage.setItem(INTERFACE_LOCALE_STORAGE_KEY, 'eu')
    renderApp('/')

    expect(
      await screen.findByRole('heading', { name: 'Zure formularioak' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveValue('eu')
  })

  it('localizes the new-form panel and its local validation', async () => {
    renderApp('/', 'es')

    await userEvent.click(
      screen.getByRole('button', { name: /nuevo formulario/i }),
    )

    expect(
      screen.getByRole('heading', { name: 'Nuevo formulario' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Plantilla 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Idioma del documento 1')).toHaveValue('en')

    await userEvent.click(
      screen.getByRole('button', { name: /crear formulario/i }),
    )

    expect(
      screen.getByText('Elige un archivo DOCX u ODT para cada idioma.'),
    ).toBeInTheDocument()
  })

  it('preserves new-form drafts across an interface-language switch', async () => {
    renderApp('/', 'es')
    await userEvent.click(
      screen.getByRole('button', { name: /nuevo formulario/i }),
    )

    const file = new File(['x'], 'draft.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    await userEvent.upload(screen.getByLabelText('Plantilla 1'), file)
    await userEvent.clear(screen.getByLabelText('Idioma del documento 2'))
    await userEvent.type(screen.getByLabelText('Idioma del documento 2'), 'eu')
    await userEvent.selectOptions(screen.getByRole('combobox'), 'eu')

    expect(await screen.findByLabelText('Txantiloia 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Dokumentuaren hizkuntza 2')).toHaveValue('eu')
    const fileInput = screen.getByLabelText('Txantiloia 1') as HTMLInputElement
    expect(fileInput.files?.[0]?.name).toBe('draft.docx')
  })

  it('shows localized variant details and hides the raw diagnostic', async () => {
    const ingestVariants = vi.fn<FormsApi['ingestVariants']>(async () => ({
      ok: false,
      errors: [
        {
          code: 'variant-mismatch',
          detail: 'label-set-mismatch',
          params: {
            locale: 'es',
            primaryLocale: 'en',
            missing: ['Name'],
            extra: ['Nombre'],
          },
          message: 'raw diagnostic',
        },
      ],
    }))

    render(
      <MemoryRouter>
        <I18nProvider initialLocale="es">
          <ServicesProvider
            value={{ forms: makeForms({ ingestVariants }), preview: fakePreview }}
          >
            <App />
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: /nuevo formulario/i }),
    )
    await userEvent.upload(
      screen.getByLabelText('Plantilla 1'),
      new File(['en'], 'en.docx'),
    )
    await userEvent.upload(
      screen.getByLabelText('Plantilla 2'),
      new File(['es'], 'es.docx'),
    )
    await userEvent.click(
      screen.getByRole('button', { name: /crear formulario/i }),
    )

    expect(
      await screen.findByText('No se pudo completar la acción'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        (content, element) =>
          element?.tagName === 'LI' &&
          content.includes('Name') &&
          content.includes('Nombre') &&
          content.includes('faltan'),
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('raw diagnostic')).not.toBeInTheDocument()
  })

  it('shows localized parse details in Basque', async () => {
    const ingestVariants = vi.fn<FormsApi['ingestVariants']>(async () => ({
      ok: false,
      errors: [
        {
          code: 'malformed-placeholder',
          detail: 'missing-closing-bracket',
          params: { placeholder: 'Name[One;;Two' },
          message: 'raw diagnostic',
        },
      ],
    }))

    render(
      <MemoryRouter>
        <I18nProvider initialLocale="eu">
          <ServicesProvider
            value={{ forms: makeForms({ ingestVariants }), preview: fakePreview }}
          >
            <App />
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: /formulario berria/i }),
    )
    await userEvent.upload(
      screen.getByLabelText('Txantiloia 1'),
      new File(['en'], 'en.docx'),
    )
    await userEvent.upload(
      screen.getByLabelText('Txantiloia 2'),
      new File(['es'], 'es.docx'),
    )
    await userEvent.click(
      screen.getByRole('button', { name: /sortu formularioa/i }),
    )

    expect(
      await screen.findByText('Ezin izan da ekintza osatu'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        (content, element) =>
          element?.tagName === 'LI' && content.includes('Name[One;;Two'),
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('raw diagnostic')).not.toBeInTheDocument()
  })

  it('keeps rendering when storage cannot be read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    renderApp('/')

    expect(screen.getByRole('heading', { name: 'Your forms' })).toBeInTheDocument()
  })

  it('keeps the in-memory choice when storage cannot be written', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    renderApp('/', 'en')
    await userEvent.selectOptions(screen.getByRole('combobox'), 'es')

    expect(screen.getByRole('heading', { name: 'Tus formularios' })).toBeInTheDocument()
  })

  it('localizes the library, counts, and single-language badge', async () => {
    render(
      <MemoryRouter>
        <I18nProvider initialLocale="es">
          <ServicesProvider
            value={{
              forms: makeForms({ list: async () => [summary, summarySingle] }),
              preview: fakePreview,
            }}
          >
            <LibraryPage />
          </ServicesProvider>
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Tus formularios')).toBeInTheDocument()
    expect(screen.getByText('2 idiomas')).toBeInTheDocument()
    expect(screen.getByText('Idioma único')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /nuevo formulario/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /importar paquete/i }),
    ).toBeInTheDocument()

    const expectedDate = new Intl.DateTimeFormat('es', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(summary.createdAt))
    expect(
      screen.getAllByText(
        (content, element) =>
          element?.tagName === 'SPAN' && content.includes(expectedDate),
      ).length,
    ).toBeGreaterThan(0)
  })

  it('localizes the unknown-route page', async () => {
    renderApp('/missing', 'es')

    expect(
      await screen.findByRole('heading', { name: 'Página no encontrada' }),
    ).toBeInTheDocument()
  })

  it('localizes the unknown-route page in Basque', async () => {
    renderApp('/missing', 'eu')

    expect(
      await screen.findByRole('heading', { name: 'Orria ez da aurkitu' }),
    ).toBeInTheDocument()
  })

  it('localizes the unexpected-error fallback', () => {
    render(
      <MemoryRouter>
        <I18nProvider initialLocale="eu">
          <UnexpectedErrorPage />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Zerbait gaizki joan da' }),
    ).toBeInTheDocument()
  })
})
