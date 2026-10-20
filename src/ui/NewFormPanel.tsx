import { useState } from 'react'
import type { FormsApi } from '../app/TemplateForms'
import type { IngestResult, TemplateError } from '../domain/types'
import { normalizeLocale } from '../domain/variants'
import { strings } from '../strings'
import { messageOf } from './errors'

interface Draft {
  id: number
  file: File | null
  locale: string
  primary: boolean
}

type Success = Extract<IngestResult, { ok: true }>

let nextDraftId = 1

function newDraft(locale: string, primary: boolean): Draft {
  return { id: nextDraftId++, file: null, locale, primary }
}

export function NewFormPanel({
  forms,
  onCreated,
  onCancel,
  onError,
}: {
  forms: FormsApi
  onCreated: (result: Success) => void
  onCancel: () => void
  onError: (errors: TemplateError[]) => void
}) {
  const [drafts, setDrafts] = useState<Draft[]>([
    newDraft('en', true),
    newDraft('es', false),
  ])
  const [busy, setBusy] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const update = (id: number, change: Partial<Draft>) => {
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, ...change } : draft)),
    )
    setValidationError(null)
  }

  const setPrimary = (id: number) => {
    setDrafts((current) =>
      current.map((draft) => ({ ...draft, primary: draft.id === id })),
    )
    setValidationError(null)
  }

  const addLanguage = () => {
    setDrafts((current) => [...current, newDraft('', false)])
  }

  const removeLanguage = (id: number) => {
    setDrafts((current) => {
      const next = current.filter((draft) => draft.id !== id)
      if (next.length > 0 && !next.some((draft) => draft.primary)) {
        next[0] = { ...next[0], primary: true }
      }
      return next
    })
  }

  const submit = async () => {
    setValidationError(null)

    if (drafts.length === 0) {
      setValidationError('Add at least one language template.')
      return
    }
    if (drafts.some((draft) => draft.file === null)) {
      setValidationError('Choose a DOCX or ODT file for every language.')
      return
    }

    const locales: string[] = []
    for (const draft of drafts) {
      const locale = normalizeLocale(draft.locale)
      if (locale === null) {
        setValidationError(
          `"${draft.locale}" is not a valid locale. Use a tag such as en, es, eu, or en-GB.`,
        )
        return
      }
      if (locales.includes(locale)) {
        setValidationError(`The locale "${locale}" is used more than once.`)
        return
      }
      locales.push(locale)
    }

    if (!drafts.some((draft) => draft.primary)) {
      setValidationError('Choose one primary language.')
      return
    }

    setBusy(true)
    try {
      const result = await forms.ingestVariants(
        drafts.map((draft) => ({
          file: draft.file as File,
          locale: draft.locale.trim(),
          primary: draft.primary,
        })),
      )
      if (!result.ok) {
        onError(result.errors)
        return
      }
      onCreated(result)
    } catch (error) {
      onError([
        {
          code: 'invalid-format',
          message: messageOf(error, strings.unsupportedUpload),
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="new-form-panel" aria-labelledby="new-form-title">
      <div className="new-form-heading">
        <div>
          <h2 id="new-form-title">{strings.newFormTitle}</h2>
          <p className="muted">{strings.newFormHint}</p>
        </div>
      </div>

      <ul className="variant-drafts">
        {drafts.map((draft, index) => (
          <li className="variant-draft" key={draft.id}>
            <div className="variant-draft-file">
              <label htmlFor={`template-${draft.id}`}>
                Template {index + 1}
              </label>
              <input
                id={`template-${draft.id}`}
                type="file"
                accept=".docx,.odt"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  update(draft.id, { file })
                }}
              />
            </div>
            <div className="variant-draft-locale">
              <label htmlFor={`locale-${draft.id}`}>
                {strings.localeLabel} {index + 1}
              </label>
              <input
                id={`locale-${draft.id}`}
                type="text"
                value={draft.locale}
                placeholder="en"
                onChange={(event) =>
                  update(draft.id, { locale: event.target.value })
                }
              />
            </div>
            <label className="primary-choice">
              <input
                type="radio"
                name="primary-locale"
                checked={draft.primary}
                onChange={() => setPrimary(draft.id)}
              />
              {strings.primaryLabel}
            </label>
            <button
              type="button"
              className="danger"
              onClick={() => removeLanguage(draft.id)}
              disabled={drafts.length === 1 || busy}
            >
              {strings.removeLanguage}
            </button>
          </li>
        ))}
      </ul>

      <p className="hint">{strings.primaryHint}</p>

      {validationError !== null && (
        <div className="errors" role="alert">
          {validationError}
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={() => void submit()} disabled={busy}>
          {strings.createForm}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={addLanguage}
          disabled={busy}
        >
          {strings.addLanguage}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={onCancel}
          disabled={busy}
        >
          {strings.cancel}
        </button>
      </div>
    </section>
  )
}
