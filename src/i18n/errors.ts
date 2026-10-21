import { TemplateFormError } from '../domain/types'
import type { TemplateError, TemplateErrorCode } from '../domain/types'
import type { LocalizedError, Messages } from './messages/types'

function isTemplateError(value: unknown): value is TemplateError {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.code === 'string' && typeof candidate.message === 'string'
  )
}

export function diagnosticOf(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') {
      return message
    }
  }
  return ''
}

export function toLocalizedError(error: unknown): LocalizedError | null {
  if (error instanceof TemplateFormError) {
    return {
      code: error.code,
      detail: error.detail,
      params: error.params,
      label: error.label,
      location: error.location,
    }
  }

  if (isTemplateError(error)) {
    return {
      code: error.code as TemplateErrorCode,
      detail: error.detail,
      params: error.params,
      label: error.label,
      location: error.location,
    }
  }

  return null
}

export function localizeError(
  error: unknown,
  messages: Messages,
  fallback: string,
): string {
  const localized = toLocalizedError(error)
  if (localized === null) {
    console.error(error)
    return fallback
  }
  if (localized.detail === 'unexpected') {
    return fallback
  }

  const factory = messages.errors[localized.code]
  return typeof factory === 'function' ? factory(localized) : fallback
}
