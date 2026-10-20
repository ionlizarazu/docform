import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useServices } from '../app/services'
import type { FilledDocument, FormView } from '../domain/types'
import { previewPrintMessage } from '../preview/renderer'
import type { PreviewResult } from '../preview/types'
import { strings } from '../strings'
import { bytesToBlob, downloadBlob } from '../ui/download'
import { messageOf } from '../ui/errors'
import NotFoundPage from './NotFoundPage'
import { previewStorageKey } from './previewStorage'

export default function PreviewPage() {
  const { route = '' } = useParams()
  const { forms, preview } = useServices()
  const [form, setForm] = useState<FormView | null | undefined>(undefined)
  const [documents, setDocuments] = useState<FilledDocument[]>([])
  const [zip, setZip] = useState<{ blob: Blob; filename: string } | null>(null)
  const [activeLocale, setActiveLocale] = useState<string | null>(null)
  const [results, setResults] = useState<Map<string, PreviewResult>>(() => new Map())
  const [loadingLocale, setLoadingLocale] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
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
        setError(null)
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
          setError(messageOf(previewError, strings.previewUnavailable))
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
              reason: messageOf(renderError, strings.previewUnavailable),
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
  }, [activeLocale, documents, preview, results])

  if (error !== null && form === undefined) {
    return (
      <section className="page">
        <h1>{strings.previewUnavailable}</h1>
        <p className="muted">{error}</p>
        <Link className="button-link" to={`/f/${route}`}>
          {strings.backToForm}
        </Link>
      </section>
    )
  }

  if (form === undefined) {
    return <p className="muted">{strings.loading}</p>
  }

  if (form === null) {
    return <NotFoundPage title={strings.notFoundTitle} body={strings.notFoundBody} />
  }

  if (noAnswers) {
    return (
      <section className="page">
        <h1>{strings.previewTitle}</h1>
        <p className="muted">{strings.previewNeedsAnswers}</p>
        <Link className="button-link" to={`/f/${route}`}>
          {strings.backToForm}
        </Link>
      </section>
    )
  }

  const activeDocument = documents.find((item) => item.locale === activeLocale)
  const activeResult = activeLocale === null ? null : results.get(activeLocale) ?? null
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
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            <Link to={`/f/${route}`}>{strings.backToForm}</Link>
          </p>
          <h1>{strings.previewTitle}</h1>
          <p className="muted">
            {form.variantCount > 1
              ? strings.previewNoticePlural
              : strings.previewNotice}
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
            {strings.print}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={download}
            disabled={zip === null && activeDocument === undefined}
          >
            {zip !== null ? strings.downloadDocuments : strings.download}
          </button>
        </div>
      </div>

      {documents.length > 1 && (
        <div className="preview-tabs" role="tablist" aria-label={strings.languageVariants}>
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

      {error !== null && (
        <div className="errors" role="alert">
          {error}
        </div>
      )}

      {activeResult === null && error === null && (
        <p className="muted">
          {loadingLocale === null
            ? strings.loading
            : `${strings.loading} ${loadingLocale}…`}
        </p>
      )}

      {activeResult?.kind === 'unavailable' && (
        <div className="notice" role="status">
          <p>{strings.previewUnavailable}</p>
          <p className="muted">{activeResult.reason}</p>
          <button type="button" onClick={download} disabled={zip === null && activeDocument === undefined}>
            {strings.downloadInstead}
          </button>
        </div>
      )}

      {activeResult?.kind === 'html' && (
        <iframe
          key={activeLocale}
          ref={iframeRef}
          className="preview-frame"
          title={strings.previewTitle}
          sandbox="allow-scripts"
          srcDoc={activeResult.html}
        />
      )}
    </section>
  )
}
