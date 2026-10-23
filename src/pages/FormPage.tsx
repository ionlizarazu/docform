import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useServices } from '../app/services'
import type { FormView } from '../domain/types'
import { fieldByLabel, primaryVariantOf } from '../domain/variants'
import { useI18n } from '../i18n/context'
import { localizeError } from '../i18n/errors'
import { BackLink } from '../ui/BackLink'
import { bytesToBlob, downloadBlob } from '../ui/download'
import NotFoundPage from './NotFoundPage'
import { previewStorageKey } from './previewStorage'

export default function FormPage() {
  const { route = '' } = useParams()
  const [searchParams] = useSearchParams()
  const detected = searchParams.get('detected') === '1'
  const { forms } = useServices()
  const { messages, locale } = useI18n()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormView | null | undefined>(undefined)
  const [answers, setAnswers] = useState<Map<string, string>>(() => new Map())
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown | null>(null)
  const [loadError, setLoadError] = useState<unknown | null>(null)

  useEffect(() => {
    let cancelled = false
    void forms
      .get(route)
      .then((loaded) => {
        if (!cancelled) {
          setLoadError(null)
          setForm(loaded)
          setAnswers(new Map())
          setDirty(false)
        }
      })
      .catch((loadFailure) => {
        if (!cancelled) {
          setLoadError(loadFailure)
        }
      })
    return () => {
      cancelled = true
    }
  }, [forms, route])

  useEffect(() => {
    if (!dirty) {
      return
    }
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = messages.leaveWarning
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty, messages.leaveWarning])

  if (loadError !== null) {
    return (
      <section className="page">
        <BackLink to="/" label={messages.backToLibrary} />
        <h1>{messages.loadFailed}</h1>
        <p className="muted">
          {localizeError(loadError, messages, messages.errorDetail)}
        </p>
      </section>
    )
  }

  if (form === undefined) {
    return <p className="muted">{messages.loading}</p>
  }

  if (form === null) {
    return <NotFoundPage />
  }

  const primary = primaryVariantOf(form.definition)
  const primaryDocumentLang =
    form.primaryLocale === 'und' ? undefined : form.primaryLocale

  if (detected) {
    return (
      <section className="page">
        <BackLink to="/" label={messages.backToLibrary} />
        <div className="page-heading">
          <div>
            <p className="eyebrow">{form.displayName}</p>
            <h1>{messages.detectedTitle}</h1>
            <p className="muted">{messages.detectedHint}</p>
          </div>
          <div className="upload-actions">
            <Link className="button-link" to={`/f/${form.route}`}>
              {messages.openForm}
            </Link>
          </div>
        </div>

        <div>
          <h2>{messages.languageVariants}</h2>
          <ul className="variant-list">
            {form.definition.variants.map((variant) => (
              <li key={variant.locale}>
                <span className="badge">
                  {variant.locale === 'und'
                    ? messages.singleLanguage
                    : variant.locale}
                </span>
                <span className="muted">{variant.format.toUpperCase()}</span>
                {variant.locale === form.primaryLocale && (
                  <span className="muted">{messages.primaryLabel}</span>
                )}
                <code>/{variant.templateHash.slice(0, 12)}…</code>
              </li>
            ))}
          </ul>
        </div>

        <ul className="detected-list">
          {primary.fields.map((field, index) => (
            <li key={`${field.label}-${index}`}>
              <div>
                <strong lang={primaryDocumentLang}>{field.label}</strong>
                <span className="badge">{messages.fieldKind(field.kind)}</span>
              </div>
              {field.kind === 'select' && (
                <div className="option-pairing">
                  {form.definition.variants.map((variant) => {
                    const variantField = fieldByLabel(variant.fields, field.label)
                    return (
                      <div key={variant.locale}>
                        <span className="badge">
                          {variant.locale === 'und'
                            ? messages.singleLanguage
                            : variant.locale}
                        </span>{' '}
                        <span
                          lang={
                            variant.locale === 'und'
                              ? undefined
                              : variant.locale
                          }
                        >
                          {variantField?.options?.join(' · ')}
                        </span>
                      </div>
                    )
                  })}
                  <p className="hint">{messages.optionPairing}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const setAnswer = (label: string, value: string) => {
    setAnswers((current) => {
      const next = new Map(current)
      next.set(label, value)
      return next
    })
    setDirty(true)
  }

  const handleDownload = async () => {
    setBusy(true)
    setError(null)
    try {
      const filled = await forms.fill(route, answers)
      if (filled.zip !== null) {
        downloadBlob(filled.zip.blob, filled.zip.filename)
      } else if (filled.documents[0] !== undefined) {
        const document = filled.documents[0]
        downloadBlob(
          bytesToBlob(document.bytes, document.mimeType),
          document.filename,
        )
      }
      setDirty(false)
    } catch (fillError) {
      setError(fillError)
    } finally {
      setBusy(false)
    }
  }

  const handlePreview = () => {
    sessionStorage.setItem(
      previewStorageKey(route),
      JSON.stringify(Array.from(answers.entries())),
    )
    navigate(`/f/${route}/preview`)
  }

  return (
    <section className="page">
      <BackLink
        to="/"
        label={messages.backToLibrary}
        onClick={(event) => {
          if (dirty && !window.confirm(messages.leaveWarning)) {
            event.preventDefault()
          }
        }}
      />
      <div className="page-heading">
        <div>
          <h1>{form.displayName}</h1>
          <div
            className="form-badges"
            role="group"
            aria-label={messages.documentLanguages}
          >
            {form.locales.map((documentLocale) => (
              <span className="badge" key={documentLocale}>
                {documentLocale === 'und'
                  ? messages.singleLanguage
                  : documentLocale}
              </span>
            ))}
          </div>
          <p className="muted">{messages.fieldsOptional}</p>
        </div>
      </div>

      {error !== null && (
        <div className="errors" role="alert">
          <strong>{messages.errorsTitle}</strong>
          <p>{localizeError(error, messages, messages.errorDetail)}</p>
        </div>
      )}

      <form
        className="form-card"
        onSubmit={(event) => {
          event.preventDefault()
          void handleDownload()
        }}
      >
        {primary.fields.map((field, index) => {
          const id = `field-${index}`
          const value = answers.get(field.label) ?? ''
          return (
            <div
              className="field"
              key={`${field.label}-${index}`}
              lang={primaryDocumentLang}
            >
              <label htmlFor={id} lang={primaryDocumentLang}>
                {field.label}
              </label>
              {field.kind === 'textarea' ? (
                <textarea
                  id={id}
                  name={field.label}
                  rows={4}
                  value={value}
                  onChange={(event) => setAnswer(field.label, event.target.value)}
                />
              ) : field.kind === 'select' ? (
                <select
                  id={id}
                  name={field.label}
                  value={value}
                  onChange={(event) => setAnswer(field.label, event.target.value)}
                >
                  <option value="" lang={locale}>
                    {messages.chooseOption}
                  </option>
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  name={field.label}
                  type="text"
                  value={value}
                  onChange={(event) => setAnswer(field.label, event.target.value)}
                />
              )}
            </div>
          )
        })}

        <div className="form-actions">
          <button type="submit" disabled={busy}>
            {form.variantCount > 1 ? messages.downloadDocuments : messages.download}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={handlePreview}
            disabled={busy}
          >
            {messages.preview}
          </button>
        </div>
      </form>
    </section>
  )
}
