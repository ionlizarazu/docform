import { createPreviewRenderer } from '../preview/renderer'
import { FormStore } from '../storage/formStore'
import { TemplateForms } from './TemplateForms'

export const templateForms = new TemplateForms(new FormStore())
export const previewRenderer = createPreviewRenderer()
