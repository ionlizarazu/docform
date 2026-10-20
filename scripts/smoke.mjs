import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import JSZip from 'jszip'
import { chromium } from 'playwright-core'

const outDir = '/tmp/opencode/docform-smoke'
const baseUrl = 'http://127.0.0.1:4173'
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
    `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="${OFFICE_NS}" xmlns:text="${TEXT_NS}" xmlns:style="${STYLE_NS}" xmlns:fo="${FO_NS}" office:version="1.2"><office:body><office:text>${op('<text:span>Dear </text:span><text:span>{{Na</text:span><text:span>me}}</text:span>')}${op('{{Role}}')}${op('{{Country[Spain;;France;;Germany]}}')}${op('{{Notes|textarea}}')}</office:text></office:body></office:document-content>`,
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
  const docxPath = path.join(outDir, 'sample-contract.docx')
  const odtPath = path.join(outDir, 'sample-letter.odt')
  await makeDocx(docxPath)
  await makeOdt(odtPath)

  const server = spawn('npm', ['run', 'dev', '--', '--port', '4173', '--strictPort'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  })
  let serverLog = ''
  server.stdout.on('data', (chunk) => {
    serverLog += chunk.toString()
  })
  server.stderr.on('data', (chunk) => {
    serverLog += chunk.toString()
  })

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    consoleErrors.push(`pageerror: ${error.message}`)
  })

  try {
    await waitForServer(baseUrl)
    await page.goto(baseUrl)
    await page.screenshot({ path: path.join(outDir, '01-library.png'), fullPage: true })

    await page.locator('input[type=file]').first().setInputFiles(docxPath)
    await page.getByText('Detected fields').waitFor()
    await page.screenshot({ path: path.join(outDir, '02-detected.png'), fullPage: true })

    await page.getByRole('link', { name: 'Open form' }).click()
    await page.getByLabel('Name').fill('Ada Lovelace')
    await page.getByLabel('Role').fill('Analyst')
    await page.getByLabel('Country').selectOption('France')
    await page.getByLabel('Notes').fill('First line\nSecond line')
    await page.getByLabel('Reference').fill('REF-42')
    await page.screenshot({ path: path.join(outDir, '03-form.png'), fullPage: true })

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download filled document' }).click()
    const download = await downloadPromise
    const filledPath = path.join(outDir, 'contract-filled.docx')
    await download.saveAs(filledPath)
    const filledZip = await JSZip.loadAsync(await readFile(filledPath))
    const filledXml = await filledZip.file('word/document.xml').async('string')
    if (filledXml.includes('{{')) {
      throw new Error('DOCX still contains a placeholder after filling')
    }
    if (!filledXml.includes('Ada Lovelace') || !filledXml.includes('France')) {
      throw new Error('DOCX is missing substituted values')
    }

    await page.getByRole('button', { name: 'Preview' }).click()
    await page.locator('iframe.preview-frame').waitFor()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(outDir, '04-docx-preview.png'), fullPage: true })
    const docxNotice = await page.getByText('The preview could not be rendered').count()
    if (docxNotice > 0) {
      throw new Error('DOCX preview fell back to unavailable')
    }

    await page.goto(baseUrl)
    await page.locator('input[type=file]').first().setInputFiles(odtPath)
    await page.getByText('Detected fields').waitFor()
    await page.screenshot({ path: path.join(outDir, '05-odt-detected.png'), fullPage: true })
    await page.getByRole('link', { name: 'Open form' }).click()
    await page.getByLabel('Name').fill('Grace Hopper')
    await page.getByLabel('Role').fill('Engineer')
    await page.getByLabel('Country').selectOption('Germany')
    await page.getByLabel('Notes').fill('ODT notes')
    await page.getByLabel('Reference').fill('ODT-7')
    await page.getByRole('button', { name: 'Preview' }).click()
    await page.locator('iframe.preview-frame').waitFor({ timeout: 45000 })
    await page.waitForTimeout(4000)
    await page.screenshot({ path: path.join(outDir, '06-odt-preview.png'), fullPage: true })
    const odtNotice = await page.getByText('The preview could not be rendered').count()
    const odtReason = odtNotice > 0 ? await page.locator('.notice').innerText() : ''

    await page.goto(baseUrl)
    await page.getByText('sample-contract').waitFor()
    await page.screenshot({
      path: path.join(outDir, '07-library-populated.png'),
      fullPage: true,
    })

    if (odtNotice > 0) {
      throw new Error(`ODT preview failed: ${odtReason}`)
    }
    if (consoleErrors.length > 0) {
      throw new Error(`Browser console errors: ${consoleErrors.join(' | ')}`)
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          outDir,
          docxDownload: filledPath,
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
    server.kill('SIGTERM')
    if (consoleErrors.length > 0) {
      console.error('Console errors:', consoleErrors)
    }
    if (!serverLog.includes('ready in')) {
      console.error('Server log:', serverLog.slice(-2000))
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
