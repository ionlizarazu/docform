import { createContext, useContext } from 'react'
import type { InterfaceLocale } from './locales'
import type { Messages } from './messages/types'

export interface I18nValue {
  locale: InterfaceLocale
  setLocale: (locale: InterfaceLocale) => void
  messages: Messages
  formatDate: (value: string | Date) => string
}

export const I18nContext = createContext<I18nValue | null>(null)

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (value === null) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return value
}
