import type { Messages } from './messages/types'

/**
 * Temporary adapter: tickets 05–07 replace the generic fallback with
 * code-specific, localized messages.
 */
export function localizeError(
  _error: unknown,
  _messages: Messages,
  fallback: string,
): string {
  return fallback
}
