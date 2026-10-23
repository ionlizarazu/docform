import type { MouseEventHandler } from 'react'
import { Link } from 'react-router-dom'

export function BackLink({
  to,
  label,
  onClick,
}: {
  to: string
  label: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}) {
  return (
    <div className="back-link-row">
      <Link className="back-link" to={to} onClick={onClick}>
        <span className="back-link-arrow" aria-hidden="true">
          ←
        </span>
        {label}
      </Link>
    </div>
  )
}
