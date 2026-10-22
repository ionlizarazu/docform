import { describe, expect, it, vi } from 'vitest'
import { localizeError } from '../i18n/errors'
import { formatDate } from '../i18n/format'
import { resolveInterfaceLocale } from '../i18n/locales'
import { messagesByLocale } from '../i18n/messages'

describe('interface locale resolution', () => {
  it('uses a valid saved choice first', () => {
    expect(resolveInterfaceLocale('es', ['en-US', 'eu-ES'])).toBe('es')
  })

  it('uses the first supported base language from the browser', () => {
    expect(resolveInterfaceLocale(null, ['fr-FR', 'eu-ES'])).toBe('eu')
    expect(resolveInterfaceLocale(null, ['es-419'])).toBe('es')
    expect(resolveInterfaceLocale(null, ['en-GB', 'es-ES'])).toBe('en')
  })

  it('falls back to English for an invalid or unsupported choice', () => {
    expect(resolveInterfaceLocale('de', ['fr-FR'])).toBe('en')
    expect(resolveInterfaceLocale(null, [])).toBe('en')
    expect(resolveInterfaceLocale(undefined, ['not a tag'])).toBe('en')
  })
})

describe('interface formatting', () => {
  it('formats dates with the interface locale', () => {
    const date = new Date('2026-01-15T12:00:00Z')
    const en = formatDate(date, 'en')
    const es = formatDate(date, 'es')
    const eu = formatDate(date, 'eu')

    expect(en).not.toBe('')
    expect(es).not.toBe('')
    expect(eu).not.toBe('')
    expect(new Set([en, es, eu]).size).toBeGreaterThan(1)
    expect(en).toBe(
      new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date),
    )
  })
})

describe('error presentation adapter', () => {
  it('falls back for unknown errors and synthetic UI errors', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(
      localizeError(
        new Error('raw diagnostic'),
        messagesByLocale.es,
        messagesByLocale.es.errorDetail,
      ),
    ).toBe('Inténtalo de nuevo.')

    expect(
      localizeError(
        {
          code: 'invalid-format',
          detail: 'unexpected',
          message: '',
        },
        messagesByLocale.es,
        messagesByLocale.es.errorDetail,
      ),
    ).toBe('Inténtalo de nuevo.')
  })

  it('localizes structured variant details without showing the raw diagnostic', () => {
    const message = localizeError(
      {
        code: 'variant-mismatch',
        detail: 'label-set-mismatch',
        params: {
          locale: 'es',
          primaryLocale: 'en',
          missing: ['Name'],
          extra: ['Nombre'],
        },
        message: 'raw diagnostic',
      },
      messagesByLocale.es,
      messagesByLocale.es.errorDetail,
    )

    expect(message).toContain('"es"')
    expect(message).toContain('"en"')
    expect(message).toContain('Name')
    expect(message).toContain('Nombre')
    expect(message).toContain('faltan')
    expect(message).not.toContain('raw diagnostic')
  })

  it('localizes package details', () => {
    expect(
      localizeError(
        {
          code: 'invalid-package',
          detail: 'route-mismatch',
          message: 'raw diagnostic',
        },
        messagesByLocale.es,
        messagesByLocale.es.errorDetail,
      ),
    ).toBe('La ruta del paquete no coincide con su contenido.')
  })

  it('localizes a missing option by position', () => {
    const message = localizeError(
      {
        code: 'option-count-mismatch',
        detail: 'missing-option-at-index',
        params: {
          label: 'Country',
          locale: 'es',
          index: 1,
        },
        message: 'raw diagnostic',
      },
      messagesByLocale.es,
      messagesByLocale.es.errorDetail,
    )

    expect(message).toContain('Country')
    expect(message).toContain('posición 2')
    expect(message).not.toContain('raw diagnostic')
  })

  it('localizes a malformed placeholder in Basque', () => {
    const message = localizeError(
      {
        code: 'malformed-placeholder',
        detail: 'missing-closing-bracket',
        params: { placeholder: 'Name[One;;Two' },
        message: 'raw diagnostic',
      },
      messagesByLocale.eu,
      messagesByLocale.eu.errorDetail,
    )

    expect(message).toContain('Name[One;;Two')
    expect(message).not.toContain('raw diagnostic')
  })
})
