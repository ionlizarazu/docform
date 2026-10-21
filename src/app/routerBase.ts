export function routerBasename(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}
