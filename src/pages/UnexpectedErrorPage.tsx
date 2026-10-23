import { useI18n } from '../i18n/context'
import { BackLink } from '../ui/BackLink'

export default function UnexpectedErrorPage() {
  const { messages } = useI18n()

  return (
    <section className="page">
      <BackLink to="/" label={messages.backToLibrary} />
      <h1>{messages.errorTitle}</h1>
      <p className="muted">{messages.errorBody}</p>
    </section>
  )
}
