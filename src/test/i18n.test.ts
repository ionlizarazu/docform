import { describe, expect, it } from 'vitest'
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
  it('pluralizes language counts in each locale', () => {
    expect(messagesByLocale.en.languageCount(1)).toBe('1 language')
    expect(messagesByLocale.en.languageCount(2)).toBe('2 languages')
    expect(messagesByLocale.es.languageCount(1)).toBe('1 idioma')
    expect(messagesByLocale.es.languageCount(2)).toBe('2 idiomas')
    expect(messagesByLocale.eu.languageCount(2)).toBe('2 hizkuntza')
  })

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
  it('falls back to a localized message until code-specific messages exist', () => {
    expect(
      localizeError(
        new Error('raw diagnostic'),
        messagesByLocale.es,
        messagesByLocale.es.errorDetail,
      ),
    ).toBe('Inténtalo de nuevo.')
  })
})
