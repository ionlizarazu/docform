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
  const [filled, setFilled] = useState<FilledDocument | null>(null)
  const [result, setResult] = useState<PreviewResult | null>(null)
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
        setFilled(null)
        setResult(null)
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
        const document = await forms.fill(route, answers)
        if (cancelled) {
          return
        }
        setFilled(document)
        const rendered = await preview.render({
          bytes: document.bytes,
          format: loaded.format,
          filename: document.filename,
        })
        if (!cancelled) {
          setResult(rendered)
        }
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
  }, [forms, preview, route])

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

  const download = () => {
    if (filled !== null) {
      downloadBlob(bytesToBlob(filled.bytes, filled.mimeType), filled.filename)
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
          <p className="muted">{strings.previewNotice}</p>
        </div>
        <div className="upload-actions">
          <button
            type="button"
            onClick={() =>
              iframeRef.current?.contentWindow?.postMessage(previewPrintMessage(), '*')
            }
            disabled={result?.kind !== 'html'}
          >
            {strings.print}
          </button>
          <button type="button" className="secondary" onClick={download} disabled={filled === null}>
            {strings.download}
          </button>
        </div>
      </div>

      {error !== null && (
        <div className="errors" role="alert">
          {error}
        </div>
      )}

      {result === null && error === null && <p className="muted">{strings.loading}</p>}

      {result?.kind === 'unavailable' && (
        <div className="notice" role="status">
          <p>{strings.previewUnavailable}</p>
          <p className="muted">{result.reason}</p>
          <button type="button" onClick={download} disabled={filled === null}>
            {strings.downloadInstead}
          </button>
        </div>
      )}

      {result?.kind === 'html' && (
        <iframe
          ref={iframeRef}
          className="preview-frame"
          title={strings.previewTitle}
          sandbox="allow-scripts"
          srcDoc={result.html}
        />
      )}
    </section>
  )
}
