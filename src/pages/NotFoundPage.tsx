import { Link } from 'react-router-dom'
import { strings } from '../strings'

export default function NotFoundPage({
  title = strings.notFoundTitle,
  body = strings.notFoundBody,
}: {
  title?: string
  body?: string
}) {
  return (
    <section className="page">
      <h1>{title}</h1>
      <p className="muted">{body}</p>
      <Link className="button-link" to="/">
        {strings.backToLibrary}
      </Link>
    </section>
  )
}
