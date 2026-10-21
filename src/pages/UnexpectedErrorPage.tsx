import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/context'

export default function UnexpectedErrorPage() {
  const { messages } = useI18n()

  return (
    <section className="page">
      <h1>{messages.errorTitle}</h1>
      <p className="muted">{messages.errorBody}</p>
      <Link className="button-link" to="/">
        {messages.backToLibrary}
      </Link>
    </section>
  )
}
