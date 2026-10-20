import type { PreviewInput, PreviewRenderer, PreviewResult } from './types'

const PREVIEW_TIMEOUT_MS = 20_000
const PRINT_MESSAGE = 'docform:print'
const PRINT_BRIDGE = `<script>window.addEventListener('message',function(event){if(event.data==='${PRINT_MESSAGE}'){window.print()}})</script>`

export function previewPrintMessage(): string {
  return PRINT_MESSAGE
}

function stripDocumentScripts(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1=$2#$2')
}

function withPrintBridge(html: string): string {
  const clean = stripDocumentScripts(html)
  if (clean.includes('</body>')) {
    return clean.replace('</body>', `${PRINT_BRIDGE}</body>`)
  }
  return `${clean}${PRINT_BRIDGE}`
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error('Preview timed out.')), milliseconds)
    }),
  ])
}

async function renderDocx(input: PreviewInput): Promise<PreviewResult> {
  const { renderAsync } = await import('docx-preview')
  const container = document.createElement('div')
  const styleContainer = document.createElement('div')

  const copy = new Uint8Array(input.bytes)
  await renderAsync(
    new Blob([copy.buffer as ArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }),
    container,
    styleContainer,
    {
      inWrapper: true,
      breakPages: true,
      ignoreLastRenderedPageBreak: false,
    },
  )

  const styles = Array.from(styleContainer.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('\n')

  return {
    kind: 'html',
    html: withPrintBridge(
      `<!doctype html><html><head><meta charset="utf-8"><style>${styles}</style><style>@page{size:A4;margin:16mm}html,body{margin:0;background:#fff}body{font-family:Arial,sans-serif}</style></head><body>${container.innerHTML}</body></html>`,
    ),
  }
}

async function renderOdt(input: PreviewInput): Promise<PreviewResult> {
  const [{ Odr }, wasmModule] = await Promise.all([
    import('@opendocument/odr-core'),
    import('@opendocument/odr-core/odr-core.wasm?url'),
  ])

  const odr = await Odr.load({
    locateFile: () => wasmModule.default,
  })

  const doc = odr.open(input.bytes, { name: input.filename })
  try {
    const views = doc.listViews()
    const view = views[0]?.index ?? 0
    const rendered = doc.render(view)
    return { kind: 'html', html: withPrintBridge(rendered.html) }
  } finally {
    doc.close()
  }
}

export function createPreviewRenderer(): PreviewRenderer {
  return {
    async render(input: PreviewInput): Promise<PreviewResult> {
      try {
        return await withTimeout(
          input.format === 'docx' ? renderDocx(input) : renderOdt(input),
          PREVIEW_TIMEOUT_MS,
        )
      } catch (error) {
        return {
          kind: 'unavailable',
          reason:
            error instanceof Error
              ? error.message
              : 'The document preview could not be rendered.',
        }
      }
    },
  }
}
