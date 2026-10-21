import { useState } from 'react'
import type { FormsApi } from '../app/TemplateForms'
import type { IngestResult, TemplateError } from '../domain/types'
import { normalizeLocale } from '../domain/variants'
import { useI18n } from '../i18n/context'
import { diagnosticOf } from '../i18n/errors'
import type { Messages } from '../i18n/messages/types'

interface Draft {
  id: number
  file: File | null
  locale: string
  primary: boolean
}

type Success = Extract<IngestResult, { ok: true }>

type PanelError =
  | { kind: 'no-template' }
  | { kind: 'missing-file' }
  | { kind: 'invalid-locale'; locale: string }
  | { kind: 'duplicate-locale'; locale: string }
  | { kind: 'no-primary' }

let nextDraftId = 1

function newDraft(locale: string, primary: boolean): Draft {
  return { id: nextDraftId++, file: null, locale, primary }
}

function panelErrorMessage(error: PanelError, messages: Messages): string {
  switch (error.kind) {
    case 'no-template':
      return messages.addAtLeastOneTemplate
    case 'missing-file':
      return messages.chooseFileForEveryLanguage
    case 'invalid-locale':
      return messages.invalidDocumentLocale(error.locale)
    case 'duplicate-locale':
      return messages.duplicateDocumentLocale(error.locale)
    case 'no-primary':
      return messages.chooseOnePrimary
  }
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
  const { messages } = useI18n()
  const [drafts, setDrafts] = useState<Draft[]>([
    newDraft('en', true),
    newDraft('es', false),
  ])
  const [busy, setBusy] = useState(false)
  const [validationError, setValidationError] = useState<PanelError | null>(null)

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
      setValidationError({ kind: 'no-template' })
      return
    }
    if (drafts.some((draft) => draft.file === null)) {
      setValidationError({ kind: 'missing-file' })
      return
    }

    const locales: string[] = []
    for (const draft of drafts) {
      const locale = normalizeLocale(draft.locale)
      if (locale === null) {
        setValidationError({ kind: 'invalid-locale', locale: draft.locale })
        return
      }
      if (locales.includes(locale)) {
        setValidationError({ kind: 'duplicate-locale', locale })
        return
      }
      locales.push(locale)
    }

    if (!drafts.some((draft) => draft.primary)) {
      setValidationError({ kind: 'no-primary' })
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
      console.error(error)
      onError([
        {
          code: 'invalid-format',
          detail: 'unexpected',
          message: diagnosticOf(error),
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
          <h2 id="new-form-title">{messages.newFormTitle}</h2>
          <p className="muted">{messages.newFormHint}</p>
        </div>
      </div>

      <ul className="variant-drafts">
        {drafts.map((draft, index) => (
          <li className="variant-draft" key={draft.id}>
            <div className="variant-draft-file">
              <label htmlFor={`template-${draft.id}`}>
                {messages.templateNumberLabel(index + 1)}
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
                {messages.documentLanguageNumberLabel(index + 1)}
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
              {messages.primaryLabel}
            </label>
            <button
              type="button"
              className="danger"
              onClick={() => removeLanguage(draft.id)}
              disabled={drafts.length === 1 || busy}
            >
              {messages.removeLanguage}
            </button>
          </li>
        ))}
      </ul>

      <p className="hint">{messages.primaryHint}</p>

      {validationError !== null && (
        <div className="errors" role="alert">
          {panelErrorMessage(validationError, messages)}
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={() => void submit()} disabled={busy}>
          {messages.createForm}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={addLanguage}
          disabled={busy}
        >
          {messages.addLanguage}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={onCancel}
          disabled={busy}
        >
          {messages.cancel}
        </button>
      </div>
    </section>
  )
}
