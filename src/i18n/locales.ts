export const INTERFACE_LOCALES = ['eu', 'es', 'en'] as const

export type InterfaceLocale = (typeof INTERFACE_LOCALES)[number]

export const DEFAULT_INTERFACE_LOCALE: InterfaceLocale = 'en'

export const INTERFACE_LOCALE_STORAGE_KEY = 'docform.interface-locale'

export const LANGUAGE_NAMES: Record<InterfaceLocale, string> = {
  eu: 'Euskara',
  es: 'Español',
  en: 'English',
}

export function isInterfaceLocale(value: unknown): value is InterfaceLocale {
  return (
    typeof value === 'string' &&
    (INTERFACE_LOCALES as readonly string[]).includes(value)
  )
}

export function baseLanguage(tag: string): string {
  return tag.trim().toLowerCase().replaceAll('_', '-').split('-')[0] ?? ''
}

export function resolveInterfaceLocale(
  stored: string | null | undefined,
  browserLanguages: readonly string[] = [],
): InterfaceLocale {
  if (isInterfaceLocale(stored)) {
    return stored
  }

  for (const tag of browserLanguages) {
    const base = baseLanguage(tag)
    if (isInterfaceLocale(base)) {
      return base
    }
  }

  return DEFAULT_INTERFACE_LOCALE
}

export function browserLanguages(): string[] {
  if (typeof navigator === 'undefined') {
    return []
  }
  const languages = navigator.languages
  if (Array.isArray(languages) && languages.length > 0) {
    return [...languages]
  }
  return navigator.language ? [navigator.language] : []
}

export function readStoredLocale(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return window.localStorage.getItem(INTERFACE_LOCALE_STORAGE_KEY)
  } catch {
    return null
  }
}

export function writeStoredLocale(locale: InterfaceLocale): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(INTERFACE_LOCALE_STORAGE_KEY, locale)
  } catch {
    // The choice remains in memory when storage is unavailable.
  }
}
