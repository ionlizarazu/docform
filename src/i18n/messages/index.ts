import type { InterfaceLocale } from '../locales'
import { en } from './en'
import { es } from './es'
import { eu } from './eu'
import type { Messages } from './types'

export const messagesByLocale: Record<InterfaceLocale, Messages> = {
  en,
  es,
  eu,
}

export type { Messages }
