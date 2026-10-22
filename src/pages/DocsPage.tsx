import { useMemo } from 'react'
import { marked } from 'marked'
import en from '../../docs/guides/en.md?raw'
import es from '../../docs/guides/es.md?raw'
import eu from '../../docs/guides/eu.md?raw'
import { useI18n } from '../i18n/context'
import type { InterfaceLocale } from '../i18n/locales'
import { BackLink } from '../ui/BackLink'

const guides: Record<InterfaceLocale, string> = { en, es, eu }

export default function DocsPage() {
  const { locale, messages } = useI18n()
  const html = useMemo(
    () => marked.parse(guides[locale], { async: false }) as string,
    [locale],
  )

  return (
    <section className="page docs-page">
      <BackLink to="/" label={messages.backToLibrary} />
      <article
        className="docs-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  )
}
