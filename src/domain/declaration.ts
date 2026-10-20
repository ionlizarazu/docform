import type { Field, FieldKind, TemplateError } from './types'

export interface TextMatch {
  start: number
  end: number
  raw: string
}

export interface DeclarationScan {
  matches: TextMatch[]
  errors: TemplateError[]
}

export interface ParsedDeclaration {
  label: string
  kind: FieldKind
  options?: string[]
}

export type DeclarationResult =
  | { ok: true; declaration: ParsedDeclaration; signature: string }
  | { ok: false; error: TemplateError }

const MODIFIER = '|textarea'

function normalizeLabel(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/g, ' ')
}

function fail(code: TemplateError['code'], message: string, label?: string): DeclarationResult {
  return { ok: false, error: { code, message, label } }
}

export function signatureOf(declaration: ParsedDeclaration): string {
  return [declaration.kind, ...(declaration.options ?? [])].join('\u0000')
}

export function parseDeclaration(raw: string): DeclarationResult {
  const trimmed = raw.normalize('NFC').trim()

  if (trimmed === '') {
    return fail('empty-label', 'A placeholder has an empty label.')
  }

  const bracketStart = trimmed.indexOf('[')

  if (bracketStart !== -1) {
    if (!trimmed.endsWith(']')) {
      return fail(
        'malformed-placeholder',
        `The placeholder {{${trimmed}}} is missing a closing bracket.`,
      )
    }
    if (trimmed.indexOf(']') !== trimmed.length - 1) {
      return fail(
        'malformed-placeholder',
        `The placeholder {{${trimmed}}} has text after its option list.`,
      )
    }
    if (trimmed.slice(bracketStart + 1, -1).includes('[')) {
      return fail(
        'malformed-placeholder',
        `The placeholder {{${trimmed}}} has more than one option list.`,
      )
    }

    const labelPart = trimmed.slice(0, bracketStart)
    if (labelPart.includes('|')) {
      return fail(
        'malformed-placeholder',
        `The placeholder {{${trimmed}}} mixes a modifier with an option list.`,
      )
    }

    const label = normalizeLabel(labelPart)
    if (label === '') {
      return fail('empty-label', `The placeholder {{${trimmed}}} has an empty label.`)
    }

    const optionPart = trimmed.slice(bracketStart + 1, -1)
    const options: string[] = []
    for (const candidate of optionPart.split(';;')) {
      const option = candidate.normalize('NFC').trim()
      if (option === '') {
        return fail(
          'empty-option',
          `The select field "${label}" has an empty option.`,
          label,
        )
      }
      if (option.includes(']')) {
        return fail(
          'malformed-placeholder',
          `An option for "${label}" contains a closing bracket.`,
          label,
        )
      }
      if (!options.includes(option)) {
        options.push(option)
      }
    }

    const declaration: ParsedDeclaration = { label, kind: 'select', options }
    return { ok: true, declaration, signature: signatureOf(declaration) }
  }

  if (trimmed.endsWith(MODIFIER)) {
    const labelPart = trimmed.slice(0, -MODIFIER.length)
    if (labelPart.includes('|') || labelPart.includes(']')) {
      return fail(
        'malformed-placeholder',
        `The placeholder {{${trimmed}}} has an invalid textarea declaration.`,
      )
    }
    const label = normalizeLabel(labelPart)
    if (label === '') {
      return fail('empty-label', `The placeholder {{${trimmed}}} has an empty label.`)
    }
    const declaration: ParsedDeclaration = { label, kind: 'textarea' }
    return { ok: true, declaration, signature: signatureOf(declaration) }
  }

  const pipe = trimmed.lastIndexOf('|')
  if (pipe !== -1) {
    const label = normalizeLabel(trimmed.slice(0, pipe))
    return fail(
      'unknown-modifier',
      `The placeholder {{${trimmed}}} uses the unknown modifier "${trimmed
        .slice(pipe + 1)
        .trim()}". Only "|textarea" is supported.`,
      label || undefined,
    )
  }

  if (trimmed.includes(']')) {
    return fail(
      'malformed-placeholder',
      `The placeholder {{${trimmed}}} has a closing bracket without an opening one.`,
    )
  }

  const label = normalizeLabel(trimmed)
  if (label === '') {
    return fail('empty-label', `The placeholder {{${trimmed}}} has an empty label.`)
  }

  const declaration: ParsedDeclaration = { label, kind: 'text' }
  return { ok: true, declaration, signature: signatureOf(declaration) }
}

export function scanDeclarations(text: string): DeclarationScan {
  const matches: TextMatch[] = []
  const errors: TemplateError[] = []
  let cursor = 0

  while (cursor < text.length) {
    const open = text.indexOf('{{', cursor)
    if (open === -1) {
      break
    }
    const close = text.indexOf('}}', open + 2)
    if (close === -1) {
      errors.push({
        code: 'malformed-placeholder',
        message: `A placeholder near "${text.slice(open, open + 40)}" is missing "}}".`,
      })
      break
    }
    const raw = text.slice(open + 2, close)
    if (raw.includes('{{')) {
      errors.push({
        code: 'malformed-placeholder',
        message: `A placeholder near "${text.slice(open, open + 40)}" opens without closing.`,
      })
      cursor = open + 2
      continue
    }
    matches.push({ start: open, end: close + 2, raw })
    cursor = close + 2
  }

  return { matches, errors }
}

export interface FieldCollection {
  fields: Field[]
  errors: TemplateError[]
}

export function collectFields(
  scan: DeclarationScan,
  fields: Field[],
  seen: Map<string, string>,
): TemplateError[] {
  const errors = [...scan.errors]

  for (const match of scan.matches) {
    const parsed = parseDeclaration(match.raw)
    if (!parsed.ok) {
      errors.push(parsed.error)
      continue
    }

    const { declaration, signature } = parsed
    const previous = seen.get(declaration.label)

    if (previous !== undefined) {
      if (previous !== signature) {
        errors.push({
          code: 'conflicting-label',
          message: `The label "${declaration.label}" is declared with conflicting kinds or options.`,
          label: declaration.label,
        })
      }
      continue
    }

    seen.set(declaration.label, signature)
    const field: Field = {
      label: declaration.label,
      kind: declaration.kind,
    }
    if (declaration.options !== undefined) {
      field.options = declaration.options
    }
    fields.push(field)
  }

  return errors
}
