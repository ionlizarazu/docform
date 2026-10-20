const PREVIEW_STORAGE_PREFIX = 'template-form-preview:'

export function previewStorageKey(route: string): string {
  return `${PREVIEW_STORAGE_PREFIX}${route}`
}
