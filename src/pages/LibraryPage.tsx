import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useServices } from '../app/services'
import type { FormSummary, TemplateError } from '../domain/types'
import { strings } from '../strings'
import { downloadBlob } from '../ui/download'
import { messageOf } from '../ui/errors'

function formatDate(value: string): string {
  return new Date(value).toLocaleString()
}

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
            <label htmlFor={`rename-${form.route}`}>{strings.formNameLabel}</label>
            <input
              id={`rename-${form.route}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <button type="button" onClick={save} disabled={busy}>
              {strings.save}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setName(form.displayName)
                setEditing(false)
              }}
            >
              {strings.cancel}
            </button>
          </div>
        ) : (
          <Link className="form-name" to={`/f/${form.route}`}>
            {form.displayName}
          </Link>
        )}
        <div className="form-meta">
          <span>
            {strings.routeLabel}: <code>/f/{form.route.slice(0, 12)}…</code>
          </span>
          <span>
            {strings.uploadedLabel}: {formatDate(form.createdAt)}
          </span>
          <span className="badge">{form.format}</span>
        </div>
      </div>
      <div className="form-actions">
        <Link className="button-link" to={`/f/${form.route}`}>
          {strings.openForm}
        </Link>
        <button type="button" className="secondary" onClick={() => setEditing(true)}>
          {strings.rename}
        </button>
        <button type="button" className="secondary" onClick={() => void onExport(form.route)}>
          {strings.export}
        </button>
        <button
          type="button"
          className="danger"
          onClick={() => {
            if (window.confirm(strings.deleteConfirm)) {
              void onDelete(form.route)
            }
          }}
        >
          {strings.delete}
        </button>
      </div>
    </li>
  )
}

export default function LibraryPage() {
  const { forms } = useServices()
  const navigate = useNavigate()
  const [items, setItems] = useState<FormSummary[]>([])
  const [errors, setErrors] = useState<TemplateError[]>([])
  const [busy, setBusy] = useState(false)
  const uploadRef = useRef<HTMLInputElement>(null)
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
      .catch((error) => {
        if (!cancelled) {
          setErrors([
            {
              code: 'invalid-format',
              message: messageOf(error, strings.loadFailed),
            },
          ])
        }
      })
    return () => {
      cancelled = true
    }
  }, [forms])

  const handleUpload = async (file: File) => {
    setBusy(true)
    setErrors([])
    try {
      const result = await forms.ingest(file)
      if (!result.ok) {
        setErrors(result.errors)
        return
      }
      await refresh()
      navigate(`/f/${result.route}?detected=1`)
    } catch (error) {
      setErrors([
        {
          code: 'invalid-format',
          message: error instanceof Error ? error.message : strings.unsupportedUpload,
        },
      ])
    } finally {
      setBusy(false)
    }
  }

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
    } catch (error) {
      setErrors([
        {
          code: 'invalid-package',
          message: error instanceof Error ? error.message : strings.unsupportedUpload,
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  const handleExport = async (route: string) => {
    setErrors([])
    try {
      const exported = await forms.exportPackage(route)
      downloadBlob(exported.blob, exported.filename)
    } catch (error) {
      setErrors([
        {
          code: 'not-found',
          message: error instanceof Error ? error.message : strings.unsupportedUpload,
        },
      ])
    }
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>{strings.libraryTitle}</h1>
          <p className="muted">{strings.librarySubtitle}</p>
        </div>
        <div className="upload-actions">
          <input
            ref={uploadRef}
            className="visually-hidden"
            type="file"
            accept=".docx,.odt"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) {
                void handleUpload(file)
              }
            }}
          />
          <button type="button" onClick={() => uploadRef.current?.click()} disabled={busy}>
            {strings.upload}
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
            {strings.importPackage}
          </button>
        </div>
      </div>

      <p className="hint">{strings.uploadHint}</p>

      {errors.length > 0 && (
        <div className="errors" role="alert">
          <strong>{strings.unsupportedUpload}</strong>
          <ul>
            {errors.map((error, index) => (
              <li key={`${error.code}-${index}`}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <p>{strings.libraryEmpty}</p>
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
                } catch (error) {
                  setErrors([
                    {
                      code: 'invalid-format',
                      message: messageOf(error, strings.loadFailed),
                    },
                  ])
                  throw error
                }
              }}
              onDelete={async (route) => {
                try {
                  await forms.remove(route)
                  await refresh()
                } catch (error) {
                  setErrors([
                    {
                      code: 'invalid-format',
                      message: messageOf(error, strings.loadFailed),
                    },
                  ])
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
