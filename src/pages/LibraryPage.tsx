import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useServices } from '../app/services'
import type { FormSummary, TemplateError } from '../domain/types'
import { useI18n } from '../i18n/context'
import { localizeError } from '../i18n/errors'
import { downloadBlob } from '../ui/download'
import { NewFormPanel } from '../ui/NewFormPanel'

function FormRow({
  form,
  onRename,
  onDelete,
  onExport,
}: {
  form: FormSummary
  onRename: (route: string, name: string) => Promise<void>
  onDelete: (route: string) => Promise<void>
  onExport: (route: string) => Promise<void>
}) {
  const { messages, formatDate } = useI18n()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(form.displayName)
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setBusy(true)
    try {
      await onRename(form.route, name)
      setEditing(false)
    } catch {
      // The parent surfaces the failure next to the library.
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="form-row">
      <div className="form-row-main">
        {editing ? (
          <div className="rename-row">
            <label htmlFor={`rename-${form.route}`}>
              {messages.formNameLabel}
            </label>
            <input
              id={`rename-${form.route}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <button type="button" onClick={save} disabled={busy}>
              {messages.save}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setName(form.displayName)
                setEditing(false)
              }}
            >
              {messages.cancel}
            </button>
          </div>
        ) : (
          <Link className="form-name" to={`/f/${form.route}`}>
            {form.displayName}
          </Link>
        )}
        <div className="form-meta">
          <span>
            {messages.routeLabel}: <code>/f/{form.route.slice(0, 12)}…</code>
          </span>
          <span>
            {messages.uploadedLabel}: {formatDate(form.createdAt)}
          </span>
          {form.locales.map((locale) => (
            <span className="badge" key={locale}>
              {locale === 'und' ? messages.singleLanguage : locale}
            </span>
          ))}
          {form.variantCount > 1 && (
            <span className="muted">
              {messages.languageCount(form.variantCount)}
            </span>
          )}
        </div>
      </div>
      <div className="form-actions">
        <Link className="button-link" to={`/f/${form.route}`}>
          {messages.openForm}
        </Link>
        <button type="button" className="secondary" onClick={() => setEditing(true)}>
          {messages.rename}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => void onExport(form.route)}
        >
          {messages.export}
        </button>
        <button
          type="button"
          className="danger"
          onClick={() => {
            if (window.confirm(messages.deleteConfirm)) {
              void onDelete(form.route)
            }
          }}
        >
          {messages.delete}
        </button>
      </div>
    </li>
  )
}

export default function LibraryPage() {
  const { forms } = useServices()
  const { messages } = useI18n()
  const navigate = useNavigate()
  const [items, setItems] = useState<FormSummary[]>([])
  const [errors, setErrors] = useState<TemplateError[]>([])
  const [busy, setBusy] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    setItems(await forms.list())
  }, [forms])

  useEffect(() => {
    let cancelled = false
    void forms
      .list()
      .then((loaded) => {
        if (!cancelled) {
          setItems(loaded)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrors([{ code: 'invalid-format', message: '' }])
        }
      })
    return () => {
      cancelled = true
    }
  }, [forms])

  const handleImport = async (file: File) => {
    setBusy(true)
    setErrors([])
    try {
      const result = await forms.importPackage(file)
      if (!result.ok) {
        setErrors(result.errors)
        return
      }
      await refresh()
      navigate(`/f/${result.route}?detected=1`)
    } catch {
      setErrors([{ code: 'invalid-package', message: '' }])
    } finally {
      setBusy(false)
    }
  }

  const handleExport = async (route: string) => {
    setErrors([])
    try {
      const exported = await forms.exportPackage(route)
      downloadBlob(exported.blob, exported.filename)
    } catch {
      setErrors([{ code: 'not-found', message: '' }])
    }
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>{messages.libraryTitle}</h1>
          <p className="muted">{messages.librarySubtitle}</p>
        </div>
        <div className="upload-actions">
          <button
            type="button"
            onClick={() => {
              setErrors([])
              setShowNewForm((current) => !current)
            }}
            disabled={busy}
          >
            {messages.upload}
          </button>
          <input
            ref={importRef}
            className="visually-hidden"
            type="file"
            accept=".json,.formpack.json,application/json"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) {
                void handleImport(file)
              }
            }}
          />
          <button
            type="button"
            className="secondary"
            onClick={() => importRef.current?.click()}
            disabled={busy}
          >
            {messages.importPackage}
          </button>
        </div>
      </div>

      <p className="hint">{messages.uploadHint}</p>

      {showNewForm && (
        <NewFormPanel
          forms={forms}
          onCreated={(result) => {
            setShowNewForm(false)
            void (async () => {
              await refresh()
              navigate(`/f/${result.route}?detected=1`)
            })()
          }}
          onCancel={() => setShowNewForm(false)}
          onError={setErrors}
        />
      )}

      {errors.length > 0 && (
        <div className="errors" role="alert">
          <strong>{messages.errorsTitle}</strong>
          <ul>
            {errors.map((error, index) => (
              <li key={`${error.code}-${index}`}>
                {localizeError(error, messages, messages.errorDetail)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <p>{messages.libraryEmpty}</p>
        </div>
      ) : (
        <ul className="form-list">
          {items.map((form) => (
            <FormRow
              key={form.route}
              form={form}
              onRename={async (route, name) => {
                try {
                  await forms.rename(route, name)
                  await refresh()
                } catch {
                  setErrors([{ code: 'invalid-format', message: '' }])
                  throw new Error('rename failed')
                }
              }}
              onDelete={async (route) => {
                try {
                  await forms.remove(route)
                  await refresh()
                } catch {
                  setErrors([{ code: 'invalid-format', message: '' }])
                }
              }}
              onExport={handleExport}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
