import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { StoredForm, StoredFormMeta } from '../domain/types'

interface StoredTemplate {
  route: string
  bytes: Uint8Array
}

interface TemplateFormsDB extends DBSchema {
  forms: {
    key: string
    value: StoredFormMeta
  }
  templates: {
    key: string
    value: StoredTemplate
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
    const { template, ...meta } = form
    await Promise.all([
      transaction.objectStore('forms').put(meta),
      transaction.objectStore('templates').put({ route: form.route, bytes: template }),
      transaction.done,
    ])
  }

  async get(route: string): Promise<StoredForm | undefined> {
    const database = await this.database
    const [meta, template] = await Promise.all([
      database.get('forms', route),
      database.get('templates', route),
    ])
    if (meta === undefined || template === undefined) {
      return undefined
    }
    return { ...meta, template: template.bytes }
  }

  async list(): Promise<StoredFormMeta[]> {
    const database = await this.database
    return database.getAll('forms')
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
