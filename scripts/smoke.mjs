import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import JSZip from 'jszip'
import { chromium } from 'playwright-core'

const outDir = '/tmp/opencode/docform-smoke'
const pagesMode = process.argv.includes('--pages')
const baseUrl = pagesMode
  ? 'http://127.0.0.1:4173/docform/'
  : 'http://127.0.0.1:4173'
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}
const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
const OFFICE_NS = 'urn:oasis:names:tc:opendocument:xmlns:office:1.0'
const TEXT_NS = 'urn:oasis:names:tc:opendocument:xmlns:text:1.0'
const STYLE_NS = 'urn:oasis:names:tc:opendocument:xmlns:style:1.0'
const FO_NS = 'urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0'
const MANIFEST_NS = 'urn:oasis:names:tc:opendocument:xmlns:manifest:1.0'
const META_NS = 'urn:oasis:names:tc:opendocument:xmlns:meta:1.0'

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function run(text, bold = false) {
  return `<w:r>${bold ? '<w:rPr><w:b/></w:rPr>' : ''}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`
}

function p(...runs) {
  return `<w:p>${runs.join('')}</w:p>`
}

async function makeDocx(filePath) {
  const zip = new JSZip()
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/></Types>`,
  )
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  )
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${WORD_NS}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${p(run('Dear '), run('{{Name}}', true), run(','))}${p(run('Your role is '), run('{{Role}}'), run('.'))}${p(run('Country: '), run('{{Country[Spain;;France;;Germany]}}'))}${p(run('Notes: '), run('{{Notes|textarea}}'))}${p(run('Signature: '), run('{{Name}}'))}<w:sectPr><w:headerReference w:type="default" r:id="rIdHeader"/><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`,
  )
  zip.file(
    'word/_rels/document.xml.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
  )
  zip.file(
    'word/header1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:w="${WORD_NS}">${p(run('Reference: {{Reference}}'))}</w:hdr>`,
  )
  zip.file(
    'word/styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="${WORD_NS}"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="24"/></w:rPr></w:style></w:styles>`,
  )
  await writeFile(filePath, await zip.generateAsync({ type: 'nodebuffer' }))
}

function op(...content) {
  return `<text:p>${content.join('')}</text:p>`
}

async function makeOdt(filePath) {
  const zip = new JSZip()
  zip.file('mimetype', 'application/vnd.oasis.opendocument.text', {
    compression: 'STORE',
  })
  zip.file(
    'META-INF/manifest.xml',
    `<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="${MANIFEST_NS}" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.text"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/><manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/><manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/><manifest:file-entry manifest:full-path="settings.xml" manifest:media-type="text/xml"/></manifest:manifest>`,
  )
  zip.file(
    'content.xml',
    `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="${OFFICE_NS}" xmlns:text="${TEXT_NS}" xmlns:style="${STYLE_NS}" xmlns:fo="${FO_NS}" office:version="1.2"><office:body><office:text>${op('<text:span>Hola </text:span><text:span>{{Na</text:span><text:span>me}}</text:span>')}${op('Su rol es {{Role}}.')}${op('País: {{Country[España;;Francia;;Alemania]}}')}${op('Notas: {{Notes|textarea}}')}</office:text></office:body></office:document-content>`,
  )
  zip.file(
    'styles.xml',
    `<?xml version="1.0" encoding="UTF-8"?><office:document-styles xmlns:office="${OFFICE_NS}" xmlns:text="${TEXT_NS}" xmlns:style="${STYLE_NS}" xmlns:fo="${FO_NS}" office:version="1.2"><office:styles/><office:automatic-styles><style:page-layout style:name="pm1"><style:page-layout-properties fo:page-width="21cm" fo:page-height="29.7cm" style:print-orientation="portrait" fo:margin="2cm"/></style:page-layout></office:automatic-styles><office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm1"><style:header>${op('Reference: {{Reference}}')}</style:header></style:master-page></office:master-styles></office:document-styles>`,
  )
  zip.file(
    'meta.xml',
    `<?xml version="1.0" encoding="UTF-8"?><office:document-meta xmlns:office="${OFFICE_NS}" xmlns:meta="${META_NS}" office:version="1.2"><office:meta><meta:generator>smoke</meta:generator></office:meta></office:document-meta>`,
  )
  zip.file(
    'settings.xml',
    `<?xml version="1.0" encoding="UTF-8"?><office:document-settings xmlns:office="${OFFICE_NS}" xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0" office:version="1.2"><office:settings/></office:document-settings>`,
  )
  await writeFile(filePath, await zip.generateAsync({ type: 'nodebuffer' }))
}

async function startPagesServer(port) {
  const distDir = path.resolve('dist')
  const entry = path.join(distDir, 'index.html')
  const fallback = path.join(distDir, '404.html')

  try {
    await readFile(entry)
    await readFile(fallback)
  } catch {
    throw new Error(
      'The Pages artifact is missing. Run npm run build:pages before npm run smoke:pages.',
    )
  }

  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1')
      const pathname = decodeURIComponent(url.pathname)
      if (pathname === '/docform') {
        response.writeHead(301, { Location: '/docform/' })
        response.end()
        return
      }
      if (!pathname.startsWith('/docform/')) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        response.end('Not found')
        return
      }

      let relative = pathname.slice('/docform'.length)
      if (relative === '' || relative === '/') {
        relative = '/index.html'
      }
      const filePath = path.join(distDir, relative)
      if (!filePath.startsWith(`${distDir}${path.sep}`)) {
        throw new Error('Path escaped the Pages artifact')
      }

      try {
        const content = await readFile(filePath)
        const type =
          MIME_TYPES[path.extname(filePath).toLowerCase()] ??
          'application/octet-stream'
        response.writeHead(200, { 'Content-Type': type })
        response.end(content)
      } catch {
        const content = await readFile(fallback)
        response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
        response.end(content)
      }
    } catch (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end(String(error))
    }
  })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', resolve)
  })
  return server
}

async function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error(`Server did not start at ${url}`)
}

async function main() {
  await mkdir(outDir, { recursive: true })
  const docxPath = path.join(outDir, 'sample-contract.en.docx')
  const odtPath = path.join(outDir, 'sample-letter.es.odt')
  await makeDocx(docxPath)
  await makeOdt(odtPath)

  const pagesServer = pagesMode ? await startPagesServer(4173) : null
  const server = pagesMode
    ? null
    : spawn('npm', ['run', 'dev', '--', '--port', '4173', '--strictPort'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env },
      })
  let serverLog = ''
  if (server !== null) {
    server.stdout.on('data', (chunk) => {
      serverLog += chunk.toString()
    })
    server.stderr.on('data', (chunk) => {
      serverLog += chunk.toString()
    })
  }

  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const consoleErrors = []
  const failedResponses = []
  let allowDocument404 = false
  let expectedFallbackUrl = null
  page.on('console', (message) => {
    if (message.type() === 'error') {
      if (
        pagesMode &&
        allowDocument404 &&
        message.text().includes('status of 404')
      ) {
        return
      }
      consoleErrors.push(message.text())
    }
  })
  page.on('response', (response) => {
    if (
      response.status() >= 400 &&
      response.url() !== expectedFallbackUrl
    ) {
      failedResponses.push(`${response.status()} ${response.url()}`)
    }
  })
  page.on('pageerror', (error) => {
    consoleErrors.push(`pageerror: ${error.message}`)
  })

  try {
    await waitForServer(baseUrl)
    await page.goto(baseUrl)
    await page.screenshot({ path: path.join(outDir, '01-library.png'), fullPage: true })

    const interfaceLanguage = page.getByRole('combobox')
    await interfaceLanguage.selectOption('eu')
    await page.getByRole('heading', { name: 'Zure formularioak' }).waitFor()
    if ((await page.locator('html').getAttribute('lang')) !== 'eu') {
      throw new Error('The document lang did not update to Basque')
    }
    if ((await page.getByRole('button', { name: 'Formulario berria' }).count()) === 0) {
      throw new Error('The Basque library chrome did not render')
    }
    await page.screenshot({
      path: path.join(outDir, '01-library-eu.png'),
      fullPage: true,
    })

    await interfaceLanguage.selectOption('es')
    await page.getByRole('heading', { name: 'Tus formularios' }).waitFor()
    if ((await page.locator('html').getAttribute('lang')) !== 'es') {
      throw new Error('The document lang did not update to Spanish')
    }
    if ((await page.getByRole('button', { name: 'Nuevo formulario' }).count()) === 0) {
      throw new Error('The Spanish library chrome did not render')
    }
    await page.screenshot({
      path: path.join(outDir, '01-library-es.png'),
      fullPage: true,
    })

    await interfaceLanguage.selectOption('en')
    await page.getByRole('heading', { name: 'Your forms' }).waitFor()
    if ((await page.locator('html').getAttribute('lang')) !== 'en') {
      throw new Error('The document lang did not return to English')
    }

    await page.getByRole('button', { name: 'New form' }).click()
    await page.getByLabel('Template 1').setInputFiles(docxPath)
    await page.getByLabel('Template 2').setInputFiles(odtPath)
    await page.getByRole('button', { name: 'Create form' }).click()
    await page.getByText('Detected fields').waitFor()
    await page.screenshot({ path: path.join(outDir, '02-detected.png'), fullPage: true })

    await page.getByRole('link', { name: 'Open form' }).click()
    await page.getByLabel('Name').waitFor()

    const formUrl = page.url().split('?')[0]
    expectedFallbackUrl = formUrl
    allowDocument404 = true
    const deepLinkResponse = await page.goto(formUrl)
    if (pagesMode && deepLinkResponse?.status() !== 404) {
      throw new Error(
        `The deep-link reload did not exercise the Pages 404 fallback (status ${deepLinkResponse?.status()}).`,
      )
    }
    await page.getByLabel('Name').waitFor()
    await page.waitForTimeout(500)
    allowDocument404 = false
    expectedFallbackUrl = null

    await page.getByLabel('Name').fill('Ada Lovelace')
    await page.getByLabel('Role').fill('Analyst')
    await page.getByLabel('Country').selectOption('France')
    await page.getByLabel('Notes').fill('First line\nSecond line')
    await page.getByLabel('Reference').fill('REF-42')
    await page.screenshot({ path: path.join(outDir, '03-form.png'), fullPage: true })

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download filled documents' }).click()
    const download = await downloadPromise
    const filledPath = path.join(outDir, 'filled-documents.zip')
    await download.saveAs(filledPath)
    const archive = await JSZip.loadAsync(await readFile(filledPath))
    const englishName = Object.keys(archive.files).find((name) =>
      name.endsWith('-en-filled.docx'),
    )
    const spanishName = Object.keys(archive.files).find((name) =>
      name.endsWith('-es-filled.odt'),
    )
    if (englishName === undefined || spanishName === undefined) {
      throw new Error('The downloaded archive is missing one of the language documents')
    }

    const englishDocx = await JSZip.loadAsync(
      await archive.file(englishName).async('uint8array'),
    )
    const englishXml = await englishDocx.file('word/document.xml').async('string')
    if (englishXml.includes('{{')) {
      throw new Error('The English document still contains a placeholder')
    }
    if (!englishXml.includes('Ada Lovelace') || !englishXml.includes('France')) {
      throw new Error('The English document is missing substituted values')
    }

    const spanishOdt = await JSZip.loadAsync(
      await archive.file(spanishName).async('uint8array'),
    )
    const spanishXml = await spanishOdt.file('content.xml').async('string')
    if (spanishXml.includes('{{')) {
      throw new Error('The Spanish document still contains a placeholder')
    }
    if (!spanishXml.includes('Ada Lovelace') || !spanishXml.includes('Francia')) {
      throw new Error('The Spanish document is missing localized values')
    }

    await page.getByRole('button', { name: 'Preview' }).click()
    await page.locator('iframe.preview-frame').waitFor()
    await page.waitForTimeout(2000)
    await page.screenshot({ path: path.join(outDir, '04-docx-preview.png'), fullPage: true })
    const docxNotice = await page.getByText('The preview could not be rendered').count()
    if (docxNotice > 0) {
      throw new Error('DOCX preview fell back to unavailable')
    }

    await page.getByRole('tab', { name: 'es' }).click()
    await page.waitForTimeout(5000)
    await page.locator('iframe.preview-frame').waitFor({ timeout: 45000 })
    await page.screenshot({ path: path.join(outDir, '05-odt-preview.png'), fullPage: true })
    const odtNotice = await page.getByText('The preview could not be rendered').count()
    const odtReason = odtNotice > 0 ? await page.locator('.notice').innerText() : ''

    await page.goto(baseUrl)
    await page.getByText('sample-contract').waitFor()
    await page.screenshot({
      path: path.join(outDir, '06-library-populated.png'),
      fullPage: true,
    })

    if (odtNotice > 0) {
      throw new Error(`ODT preview failed: ${odtReason}`)
    }
    if (failedResponses.length > 0) {
      throw new Error(`Failed network responses: ${failedResponses.join(' | ')}`)
    }
    if (consoleErrors.length > 0) {
      throw new Error(`Browser console errors: ${consoleErrors.join(' | ')}`)
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          outDir,
          zipDownload: filledPath,
          docxPreview: docxNotice === 0,
          odtPreview: odtNotice === 0,
          odtReason,
          consoleErrors,
        },
        null,
        2,
      ),
    )
  } finally {
    await browser.close()
    if (pagesServer !== null) {
      await new Promise((resolve) => pagesServer.close(resolve))
    } else if (server !== null) {
      server.kill('SIGTERM')
    }
    if (consoleErrors.length > 0) {
      console.error('Console errors:', consoleErrors)
    }
    if (server !== null && !serverLog.includes('ready in')) {
      console.error('Server log:', serverLog.slice(-2000))
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
