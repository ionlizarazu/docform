import { createContext, useContext } from 'react'
import type { PreviewRenderer } from '../preview/types'
import type { FormsApi } from './TemplateForms'
import { previewRenderer, templateForms } from './service'

export interface Services {
  forms: FormsApi
  preview: PreviewRenderer
}

export const ServicesContext = createContext<Services>({
  forms: templateForms,
  preview: previewRenderer,
})

export function useServices(): Services {
  return useContext(ServicesContext)
}
