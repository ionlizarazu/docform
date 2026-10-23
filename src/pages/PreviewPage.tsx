import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useServices } from '../app/services'
import type { FilledDocument, FormView } from '../domain/types'
import { useI18n } from '../i18n/context'
import { localizeError } from '../i18n/errors'
import { previewPrintMessage } from '../preview/renderer'
import type { PreviewResult } from '../preview/types'
import { BackLink } from '../ui/BackLink'
import { bytesToBlob, downloadBlob } from '../ui/download'
import NotFoundPage from './NotFoundPage'
import { previewStorageKey } from './previewStorage'

export default function PreviewPage() {
  const { route = '' } = useParams()
  const { forms, preview } = useServices()
  const { messages } = useI18n()
  const [form, setForm] = useState<FormView | null | undefined>(undefined)
  const [documents, setDocuments] = useState<FilledDocument[]>([])
  const [zip, setZip] = useState<{ blob: Blob; filename: string } | null>(null)
  const [activeLocale, setActiveLocale] = useState<string | null>(null)
  const [results, setResults] = useState<Map<string, PreviewResult>>(() => new Map())
  const [loadingLocale, setLoadingLocale] = useState<string | null>(null)
  const [failure, setFailure] = useState<unknown | null>(null)
  const [noAnswers, setNoAnswers] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        await Promise.resolve()
        if (cancelled) {
          return
        }
        setForm(undefined)
        setDocuments([])
        setZip(null)
        setActiveLocale(null)
        setResults(new Map())
        setLoadingLocale(null)
        setFailure(null)
        setNoAnswers(false)

        const loaded = await forms.get(route)
        if (cancelled) {
          return
        }
        setForm(loaded)
        if (loaded === null) {
          return
        }

        const raw = sessionStorage.getItem(previewStorageKey(route))
        if (raw === null) {
          setNoAnswers(true)
          return
        }

        const entries = JSON.parse(raw) as [string, string][]
        const answers = new Map(entries)
        const set = await forms.fill(route, answers)
        if (cancelled) {
          return
        }
        setDocuments(set.documents)
        setZip(set.zip)
        setActiveLocale(set.documents[0]?.locale ?? null)
      } catch (previewError) {
        if (!cancelled) {
          setFailure(previewError)
        }
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [forms, route])

  useEffect(() => {
    if (activeLocale === null) {
      return
    }
    const document = documents.find((item) => item.locale === activeLocale)
    if (document === undefined || results.has(activeLocale)) {
      return
    }

    let cancelled = false

    const run = async () => {
      await Promise.resolve()
      if (cancelled) {
        return
      }
      setLoadingLocale(activeLocale)
      try {
        const result = await preview.render({
          bytes: document.bytes,
          format: document.format,
          filename: document.filename,
        })
        if (!cancelled) {
          setResults((current) => new Map(current).set(activeLocale, result))
        }
      } catch (renderError) {
        if (!cancelled) {
          setResults((current) =>
            new Map(current).set(activeLocale, {
              kind: 'unavailable',
              reason:
                renderError instanceof Error
                  ? renderError.message
                  : messages.previewUnavailable,
            }),
          )
        }
      } finally {
        if (!cancelled) {
          setLoadingLocale(null)
        }
      }
    }
    void run()

    return () => {
      cancelled = true
    }
  }, [activeLocale, documents, messages.previewUnavailable, preview, results])

  if (failure !== null && form === undefined) {
    return (
      <section className="page">
        <BackLink to={`/f/${route}`} label={messages.backToForm} />
        <h1>{messages.errorsTitle}</h1>
        <p className="muted">
          {localizeError(failure, messages, messages.errorDetail)}
        </p>
      </section>
    )
  }

  if (form === undefined) {
    return (
      <section className="page">
        <BackLink to={`/f/${route}`} label={messages.backToForm} />
        <p className="muted">{messages.loading}</p>
      </section>
    )
  }

  if (form === null) {
    return <NotFoundPage />
  }

  if (noAnswers) {
    return (
      <section className="page">
        <BackLink to={`/f/${route}`} label={messages.backToForm} />
        <h1>{messages.previewTitle}</h1>
        <p className="muted">{messages.previewNeedsAnswers}</p>
      </section>
    )
  }

  const activeDocument = documents.find((item) => item.locale === activeLocale)
  const activeResult =
    activeLocale === null ? null : (results.get(activeLocale) ?? null)
  const download = () => {
    if (zip !== null) {
      downloadBlob(zip.blob, zip.filename)
    } else if (activeDocument !== undefined) {
      downloadBlob(
        bytesToBlob(activeDocument.bytes, activeDocument.mimeType),
        activeDocument.filename,
      )
    }
  }

  return (
    <section className="page">
      <BackLink to={`/f/${route}`} label={messages.backToForm} />
      <div className="page-heading">
        <div>
          <h1>{messages.previewTitle}</h1>
          <p className="muted">
            {form.variantCount > 1
              ? messages.previewNoticePlural
              : messages.previewNotice}
          </p>
        </div>
        <div className="upload-actions">
          <button
            type="button"
            onClick={() =>
              iframeRef.current?.contentWindow?.postMessage(previewPrintMessage(), '*')
            }
            disabled={activeResult?.kind !== 'html'}
          >
            {messages.print}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={download}
            disabled={zip === null && activeDocument === undefined}
          >
            {zip !== null ? messages.downloadDocuments : messages.download}
          </button>
        </div>
      </div>

      {documents.length > 1 && (
        <div
          className="preview-tabs"
          role="tablist"
          aria-label={messages.documentLanguages}
        >
          {documents.map((document) => (
            <button
              key={document.locale}
              type="button"
              role="tab"
              aria-selected={document.locale === activeLocale}
              className={document.locale === activeLocale ? 'tab active' : 'tab'}
              onClick={() => setActiveLocale(document.locale)}
            >
              {document.locale}
            </button>
          ))}
        </div>
      )}

      {failure !== null && (
        <div className="errors" role="alert">
          <strong>{messages.errorsTitle}</strong>
          <p>{localizeError(failure, messages, messages.errorDetail)}</p>
        </div>
      )}

      {activeResult === null && failure === null && (
        <p className="muted">
          {loadingLocale === null
            ? messages.loading
            : messages.loadingDocument(loadingLocale)}
        </p>
      )}

      {activeResult?.kind === 'unavailable' && (
        <div className="notice" role="status">
          <p>{messages.previewUnavailable}</p>
          <details className="technical-details">
            <summary>{messages.technicalDetails}</summary>
            <p className="muted">{activeResult.reason}</p>
          </details>
          <button
            type="button"
            onClick={download}
            disabled={zip === null && activeDocument === undefined}
          >
            {messages.downloadInstead}
          </button>
        </div>
      )}

      {activeResult?.kind === 'html' && (
        <iframe
          key={activeLocale}
          ref={iframeRef}
          className="preview-frame"
          title={messages.previewTitle}
          sandbox="allow-scripts"
          srcDoc={activeResult.html}
        />
      )}
    </section>
  )
}
