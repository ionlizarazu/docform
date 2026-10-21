import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/context'

export default function NotFoundPage({
  title,
  body,
}: {
  title?: string
  body?: string
}) {
  const { messages } = useI18n()

  return (
    <section className="page">
      <h1>{title ?? messages.notFoundTitle}</h1>
      <p className="muted">{body ?? messages.notFoundBody}</p>
      <Link className="button-link" to="/">
        {messages.backToLibrary}
      </Link>
    </section>
  )
}
