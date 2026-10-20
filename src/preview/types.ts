import type { TemplateFormat } from '../domain/types'

export interface PreviewInput {
  bytes: Uint8Array
  format: TemplateFormat
  filename: string
}

export type PreviewResult =
  | { kind: 'html'; html: string }
  | { kind: 'unavailable'; reason: string }

export interface PreviewRenderer {
  render(input: PreviewInput): Promise<PreviewResult>
}
