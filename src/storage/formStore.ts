import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type {
  Field,
  StoredForm,
  StoredFormMeta,
  StoredTemplateVariant,
  TemplateFormat,
} from '../domain/types'

interface StoredTemplateRecord {
  route: string
  variants?: StoredTemplateVariant[]
  bytes?: Uint8Array
}

interface TemplateFormsDB extends DBSchema {
  forms: {
    key: string
    value: StoredFormMeta
  }
  templates: {
    key: string
    value: StoredTemplateRecord
  }
}

interface LegacyFormMeta {
  route: string
  displayName: string
  originalFilename: string
  format: TemplateFormat
  definition: {
    route: string
    format: TemplateFormat
    fields: Field[]
  }
  createdAt: string
}

function isNewMeta(value: unknown): value is StoredFormMeta {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  if (typeof candidate.definition !== 'object' || candidate.definition === null) {
    return false
  }
  return Array.isArray((candidate.definition as Record<string, unknown>).variants)
}

function normalizeMeta(value: unknown): StoredFormMeta {
  if (isNewMeta(value)) {
    return value
  }

  const legacy = value as LegacyFormMeta
  const format = legacy.format
  return {
    route: legacy.route,
    displayName: legacy.displayName,
    originalFilename: legacy.originalFilename,
    primaryLocale: 'und',
    locales: ['und'],
    variantCount: 1,
    createdAt: legacy.createdAt,
    definition: {
      route: legacy.route,
      primaryLocale: 'und',
      variants: [
        {
          locale: 'und',
          format,
          templateHash: legacy.route,
          fields: legacy.definition.fields,
        },
      ],
    },
  }
}

export class FormStore {
  private readonly database: Promise<IDBPDatabase<TemplateFormsDB>>

  constructor(databaseName = 'template-form-docs') {
    this.database = openDB<TemplateFormsDB>(databaseName, 1, {
      upgrade(database) {
        database.createObjectStore('forms', { keyPath: 'route' })
        database.createObjectStore('templates', { keyPath: 'route' })
      },
    })
  }

  async put(form: StoredForm): Promise<void> {
    const database = await this.database
    const transaction = database.transaction(['forms', 'templates'], 'readwrite')
    const { templates, ...meta } = form
    await Promise.all([
      transaction.objectStore('forms').put(meta),
      transaction.objectStore('templates').put({ route: form.route, variants: templates }),
      transaction.done,
    ])
  }

  async get(route: string): Promise<StoredForm | undefined> {
    const database = await this.database
    const [rawMeta, templateRecord] = await Promise.all([
      database.get('forms', route),
      database.get('templates', route),
    ])
    if (rawMeta === undefined || templateRecord === undefined) {
      return undefined
    }

    const meta = normalizeMeta(rawMeta)
    let templates: StoredTemplateVariant[]

    if (templateRecord.variants !== undefined) {
      templates = templateRecord.variants
    } else if (templateRecord.bytes !== undefined) {
      templates = [
        {
          locale: 'und',
          format: meta.definition.variants[0].format,
          bytes: templateRecord.bytes,
        },
      ]
    } else {
      return undefined
    }

    return { ...meta, templates }
  }

  async list(): Promise<StoredFormMeta[]> {
    const database = await this.database
    const records = await database.getAll('forms')
    return records.map((record) => normalizeMeta(record))
  }

  async delete(route: string): Promise<void> {
    const database = await this.database
    const transaction = database.transaction(['forms', 'templates'], 'readwrite')
    await Promise.all([
      transaction.objectStore('forms').delete(route),
      transaction.objectStore('templates').delete(route),
      transaction.done,
    ])
  }

  async close(): Promise<void> {
    const database = await this.database
    database.close()
  }
}
