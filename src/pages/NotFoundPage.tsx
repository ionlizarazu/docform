import { useI18n } from '../i18n/context'
import { BackLink } from '../ui/BackLink'

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
      <BackLink to="/" label={messages.backToLibrary} />
      <h1>{title ?? messages.notFoundTitle}</h1>
      <p className="muted">{body ?? messages.notFoundBody}</p>
    </section>
  )
}
