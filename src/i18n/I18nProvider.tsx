import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { I18nContext } from './context'
import type { I18nValue } from './context'
import { formatDate } from './format'
import {
  browserLanguages,
  readStoredLocale,
  resolveInterfaceLocale,
  writeStoredLocale,
} from './locales'
import type { InterfaceLocale } from './locales'
import { messagesByLocale } from './messages'

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode
  initialLocale?: InterfaceLocale
}) {
  const [locale, setLocaleState] = useState<InterfaceLocale>(() =>
    initialLocale ??
    resolveInterfaceLocale(readStoredLocale(), browserLanguages()),
  )

  const setLocale = useCallback((next: InterfaceLocale) => {
    setLocaleState(next)
    writeStoredLocale(next)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const format = useCallback(
    (value: string | Date) => formatDate(value, locale),
    [locale],
  )

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      messages: messagesByLocale[locale],
      formatDate: format,
    }),
    [locale, setLocale, format],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
