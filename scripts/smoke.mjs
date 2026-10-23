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
const languageNames = {
  eu: 'eu — Euskara',
  es: 'es — Español',
  en: 'en — English',
}

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
  let expectedFallbackUrl = null
  page.on('console', (message) => {
    if (message.type() === 'error') {
      if (pagesMode && message.text().includes('status of 404')) {
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

  async function capture(name, fullPage = true) {
    await page.mouse.move(1, 1)
    await page.waitForTimeout(250)
    await page.screenshot({ path: path.join(outDir, name), fullPage })
  }

  const edgeTolerance = 1.5
  let contentColumn = null

  async function boxOfLocator(locator, description) {
    const box = await locator.first().boundingBox()
    if (box === null) {
      throw new Error(`The ${description} is missing its bounding box`)
    }
    return box
  }

  async function assertStartsAtContentColumn(locator, description) {
    if (contentColumn === null) {
      throw new Error('The content column has not been measured yet')
    }
    const box = await boxOfLocator(locator, description)
    if (Math.abs(box.x - contentColumn.left) > edgeTolerance) {
      throw new Error(
        `The ${description} starts at ${box.x}px but the content column starts at ${contentColumn.left}px`,
      )
    }
  }

  async function assertAbove(first, second, description) {
    const firstBox = await boxOfLocator(first, description)
    const secondBox = await boxOfLocator(second, description)
    if (firstBox.y + firstBox.height > secondBox.y + edgeTolerance) {
      throw new Error(
        `The ${description} ends at ${firstBox.y + firstBox.height}px but the element below starts at ${secondBox.y}px`,
      )
    }
  }

  async function assertNoHorizontalOverflow(label) {
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    if (overflow.scrollWidth > overflow.clientWidth) {
      throw new Error(
        `The ${label} overflows horizontally (${overflow.scrollWidth} > ${overflow.clientWidth})`,
      )
    }
  }

  async function assertWithinViewport(locator, description) {
    const box = await boxOfLocator(locator, description)
    const width = await page.evaluate(() => document.documentElement.clientWidth)
    if (box.x < -edgeTolerance || box.x + box.width > width + edgeTolerance) {
      throw new Error(
        `The ${description} spans ${box.x}..${box.x + box.width}px outside the ${width}px viewport`,
      )
    }
  }

  async function captureContentColumn() {
    const formCard = await boxOfLocator(page.locator('form'), 'form card')
    contentColumn = {
      left: formCard.x,
      right: formCard.x + formCard.width,
    }

    const brand = await boxOfLocator(
      page.getByRole('link', { name: 'Docform' }),
      'header brand',
    )
    if (Math.abs(brand.x - contentColumn.left) > edgeTolerance) {
      throw new Error(
        `The header brand starts at ${brand.x}px but the content column starts at ${contentColumn.left}px`,
      )
    }

    const languageSwitcher = await boxOfLocator(
      page.getByRole('group', { name: 'Interface language' }),
      'interface language switcher',
    )
    const languageRight = languageSwitcher.x + languageSwitcher.width
    if (Math.abs(languageRight - contentColumn.right) > edgeTolerance) {
      throw new Error(
        `The interface language switcher ends at ${languageRight}px but the content column ends at ${contentColumn.right}px`,
      )
    }
  }

  async function assertLocatorUsesContentColumn(locator, description) {
    if (contentColumn === null) {
      throw new Error('The content column has not been measured yet')
    }
    const box = await boxOfLocator(locator, description)
    if (
      Math.abs(box.x - contentColumn.left) > edgeTolerance ||
      Math.abs(box.x + box.width - contentColumn.right) > edgeTolerance
    ) {
      throw new Error(
        `The ${description} spans ${box.x}..${box.x + box.width}px but the content column spans ${contentColumn.left}..${contentColumn.right}px`,
      )
    }
  }

  try {
    await waitForServer(baseUrl)
    await page.goto(baseUrl)
    await page.getByRole('heading', { name: 'Your forms' }).waitFor()
    await capture('01-library.png')

    const removedUploadHint =
      'Add one DOCX or ODT template per language, up to 25 MB each. Declare fields with {{Label}}.'
    if ((await page.getByText(removedUploadHint).count()) !== 0) {
      throw new Error('The removed library upload hint is still rendered')
    }

    const libraryToolbar = page.getByRole('group', { name: 'Your forms' })
    await libraryToolbar.waitFor()
    const toolbarButtons = await libraryToolbar
      .getByRole('button')
      .allTextContents()
    if (
      toolbarButtons.map((label) => label.trim()).join('|') !==
      'New form|Import package'
    ) {
      throw new Error(
        `The library toolbar buttons are ${JSON.stringify(toolbarButtons)}, expected New form then Import package`,
      )
    }
    const libraryHeading = page.getByRole('heading', {
      level: 1,
      name: 'Your forms',
    })
    if (
      (await libraryHeading.locator('xpath=..').getByRole('button').count()) !==
      0
    ) {
      throw new Error('The library heading still contains action buttons')
    }
    const libraryEmptyState = page.getByText(
      'No forms yet. Upload a DOCX or ODT template to begin.',
    )
    await libraryEmptyState.waitFor()
    await assertAbove(
      libraryToolbar,
      libraryEmptyState,
      'library toolbar above the empty state',
    )

    if ((await page.getByRole('combobox').count()) !== 0) {
      throw new Error('The old header language select is still rendered')
    }
    const headerNav = page.getByRole('navigation')
    if ((await headerNav.getByRole('link', { name: 'Forms' }).count()) === 0) {
      throw new Error('The header is missing the Forms menu item')
    }
    if ((await headerNav.getByRole('link', { name: 'Docs' }).count()) === 0) {
      throw new Error('The header is missing the Docs menu item')
    }
    if (
      (await page.getByText('Turn documents into forms without leaving your browser.').count()) !==
      0
    ) {
      throw new Error('The removed tagline is still rendered')
    }

    async function selectInterfaceLanguage(code, headingName) {
      const accessibleName = languageNames[code]
      const button = page.getByRole('button', { name: accessibleName })
      await button.click()
      await page.getByRole('heading', { name: headingName }).waitFor()

      if (!accessibleName.includes(code)) {
        throw new Error(`The ${code} language button does not expose its visible code`)
      }
      const label = await button.getAttribute('aria-label')
      if (label !== accessibleName) {
        throw new Error(
          `The ${code} language button accessible name is ${label}, expected ${accessibleName}`,
        )
      }

      const pressed = await button.getAttribute('aria-pressed')
      if (pressed !== 'true') {
        throw new Error(
          `The ${code} language button is not marked as selected (aria-pressed=${pressed})`,
        )
      }
      for (const [otherCode, otherName] of Object.entries(languageNames)) {
        if (otherCode === code) {
          continue
        }
        const otherPressed = await page
          .getByRole('button', { name: otherName })
          .getAttribute('aria-pressed')
        if (otherPressed !== 'false') {
          throw new Error(
            `The ${otherCode} language button remained selected after choosing ${code}`,
          )
        }
      }
      if ((await page.locator('html').getAttribute('lang')) !== code) {
        throw new Error(`The document lang did not update to ${code}`)
      }
    }

    await selectInterfaceLanguage('eu', 'Zure formularioak')
    if ((await page.getByRole('button', { name: 'Formulario berria' }).count()) === 0) {
      throw new Error('The Basque library chrome did not render')
    }
    await capture('01-library-eu.png')

    await selectInterfaceLanguage('es', 'Tus formularios')
    if ((await page.getByRole('button', { name: 'Nuevo formulario' }).count()) === 0) {
      throw new Error('The Spanish library chrome did not render')
    }
    await capture('01-library-es.png')

    await selectInterfaceLanguage('en', 'Your forms')

    await page.getByRole('button', { name: 'New form' }).click()
    await page.getByLabel('Template 1').setInputFiles(docxPath)
    await page.getByLabel('Template 2').setInputFiles(odtPath)
    await page.getByRole('button', { name: 'Create form' }).click()
    await page.getByText('Detected fields').waitFor()
    await capture('02-detected.png')

    const detectedHeading = page.getByRole('heading', {
      level: 1,
      name: 'Detected fields',
    })
    const detectedBack = page.getByRole('link', { name: 'Back to forms' })
    await assertAbove(detectedBack, detectedHeading, 'detected-fields back link')
    const detectedBackBox = await boxOfLocator(detectedBack, 'detected-fields back link')
    const detectedHeadingBox = await boxOfLocator(
      detectedHeading,
      'detected-fields heading',
    )
    if (Math.abs(detectedBackBox.x - detectedHeadingBox.x) > edgeTolerance) {
      throw new Error(
        `The detected-fields back link starts at ${detectedBackBox.x}px but the heading starts at ${detectedHeadingBox.x}px`,
      )
    }
    if (
      (await page.getByRole('link', { name: 'Open form' }).count()) === 0
    ) {
      throw new Error('The detected-fields page lost its Open form action')
    }

    await page.getByRole('link', { name: 'Open form' }).click()
    await page.getByLabel('Name').waitFor()

    if (pagesMode) {
      const formUrl = page.url().split('?')[0]
      expectedFallbackUrl = formUrl
      const deepLinkResponse = await page.goto(formUrl)
      if (deepLinkResponse?.status() !== 404) {
        throw new Error(
          `The deep-link reload did not exercise the Pages 404 fallback (status ${deepLinkResponse?.status()}).`,
        )
      }
      await page.getByLabel('Name').waitFor()
      expectedFallbackUrl = null
    }

    await page.getByLabel('Name').fill('Ada Lovelace')
    await page.getByLabel('Role').fill('Analyst')
    await page.getByLabel('Country').selectOption('France')
    await page.getByLabel('Notes').fill('First line\nSecond line')
    await page.getByLabel('Reference').fill('REF-42')
    await capture('03-form.png')
    await captureContentColumn()

    const formHeading = page.getByRole('heading', {
      level: 1,
      name: 'sample-contract',
    })
    await assertStartsAtContentColumn(formHeading, 'form page heading')
    const formBack = page.getByRole('link', { name: 'Back to forms' })
    await assertAbove(formBack, formHeading, 'form back link')
    await assertStartsAtContentColumn(formBack, 'form back link')

    const formBadges = page.getByRole('group', { name: 'Document languages' })
    await assertAbove(formHeading, formBadges, 'form title above the badges')
    await assertAbove(
      formBadges,
      page.getByText('All fields are optional.'),
      'form badges above the optional-fields note',
    )
    await assertStartsAtContentColumn(formBadges, 'form language badges')
    const badgeTexts = (await formBadges.locator('span').allTextContents()).map(
      (text) => text.trim().toLowerCase(),
    )
    if (badgeTexts.join('|') !== 'en|es') {
      throw new Error(
        `The form badges are ${JSON.stringify(badgeTexts)}, expected en then es`,
      )
    }
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
    await page.locator('iframe').waitFor()
    await page.waitForTimeout(2000)
    await capture('04-docx-preview.png')
    await assertLocatorUsesContentColumn(page.locator('iframe'), 'preview frame')

    const previewHeading = page.getByRole('heading', {
      level: 1,
      name: 'Approximate preview',
    })
    const previewBack = page.getByRole('link', { name: 'Back to form' })
    await assertAbove(previewBack, previewHeading, 'preview back link')
    await assertStartsAtContentColumn(previewBack, 'preview back link')
    const previewTabs = page.getByRole('tablist', {
      name: 'Document languages',
    })
    if (!(await previewTabs.isVisible())) {
      throw new Error('The preview document-language tabs are missing')
    }
    if (!(await page.getByRole('button', { name: 'Print' }).isVisible())) {
      throw new Error('The preview lost its Print action')
    }
    if (
      !(await page
        .getByRole('button', { name: 'Download filled documents' })
        .isVisible())
    ) {
      throw new Error('The preview lost its Download action')
    }

    const docxNotice = await page.getByText('The preview could not be rendered').count()
    if (docxNotice > 0) {
      throw new Error('DOCX preview fell back to unavailable')
    }

    await page.getByRole('tab', { name: 'es' }).click()
    await page.waitForTimeout(5000)
    await page.locator('iframe').waitFor({ timeout: 45000 })
    await capture('05-odt-preview.png')
    const odtNotice = await page.getByText('The preview could not be rendered').count()
    const odtReason = odtNotice > 0 ? await page.locator('.notice').innerText() : ''

    await page.goto(baseUrl)
    await page.getByText('sample-contract').waitFor()
    await capture('06-library-populated.png')
    await assertStartsAtContentColumn(
      page.getByRole('heading', { level: 1, name: 'Your forms' }),
      'library page heading',
    )
    await assertLocatorUsesContentColumn(page.getByRole('list'), 'library forms list')
    await assertLocatorUsesContentColumn(
      page.getByRole('listitem').first(),
      'library form row',
    )
    const populatedToolbar = page.getByRole('group', { name: 'Your forms' })
    await assertAbove(
      populatedToolbar,
      page.getByRole('list'),
      'library toolbar above the forms list',
    )
    if ((await page.getByText(removedUploadHint).count()) !== 0) {
      throw new Error('The removed library upload hint is still rendered')
    }

    await page.setViewportSize({ width: 390, height: 900 })
    if (!(await page.getByRole('navigation').isVisible())) {
      throw new Error('The header menu is not visible on a narrow viewport')
    }
    if (
      !(await page
        .getByRole('group', { name: 'Interface language' })
        .isVisible())
    ) {
      throw new Error(
        'The interface-language group is not visible on a narrow viewport',
      )
    }
    await assertNoHorizontalOverflow('narrow layout')
    const narrowToolbar = page.getByRole('group', { name: 'Your forms' })
    if (!(await narrowToolbar.isVisible())) {
      throw new Error('The library toolbar is not visible on a narrow viewport')
    }
    const narrowToolbarButtons = await narrowToolbar.getByRole('button').all()
    if (narrowToolbarButtons.length !== 2) {
      throw new Error(
        `The narrow library toolbar has ${narrowToolbarButtons.length} buttons, expected 2`,
      )
    }
    for (const button of narrowToolbarButtons) {
      await assertWithinViewport(button, 'narrow library toolbar button')
    }
    await assertAbove(
      page.getByRole('link', { name: 'sample-contract' }),
      page.getByRole('link', { name: 'Open form' }),
      'form name above the row actions',
    )
    await capture('08-library-narrow.png')

    await page.getByRole('link', { name: 'sample-contract' }).click()
    await page.getByLabel('Name').waitFor()
    const narrowFormBack = page.getByRole('link', { name: 'Back to forms' })
    if (!(await narrowFormBack.isVisible())) {
      throw new Error('The form back link is not visible on a narrow viewport')
    }
    const narrowFormBadges = page.getByRole('group', {
      name: 'Document languages',
    })
    if (!(await narrowFormBadges.isVisible())) {
      throw new Error('The form language badges are not visible on a narrow viewport')
    }
    await assertWithinViewport(narrowFormBack, 'narrow form back link')
    await assertWithinViewport(narrowFormBadges, 'narrow form badges')
    await assertNoHorizontalOverflow('narrow form layout')
    await narrowFormBack.click()
    await page.getByRole('heading', { name: 'Your forms' }).waitFor()

    await page.setViewportSize({ width: 1280, height: 900 })

    const docsUrl = new URL('docs', baseUrl).toString()
    expectedFallbackUrl = docsUrl
    const docsResponse = await page.goto(docsUrl)
    if (pagesMode && docsResponse?.status() !== 404) {
      throw new Error(
        `The docs route did not exercise the Pages 404 fallback (status ${docsResponse?.status()}).`,
      )
    }
    await page.getByRole('heading', { name: 'Docform guide' }).waitFor()
    await capture('07-docs.png', false)
    const docsBack = page.getByRole('link', { name: 'Back to forms' })
    const docsArticle = page.getByRole('article')
    await assertAbove(docsBack, docsArticle, 'docs back link above the article')
    await assertStartsAtContentColumn(docsBack, 'docs back link')
    await assertLocatorUsesContentColumn(docsArticle, 'docs article')
    const docsBox = await boxOfLocator(docsArticle, 'docs article')
    if (contentColumn === null) {
      throw new Error('The content column has not been measured yet')
    }
    const contentWidth = contentColumn.right - contentColumn.left
    if (Math.abs(docsBox.width - contentWidth) > edgeTolerance * 2) {
      throw new Error(
        `The docs article is ${docsBox.width}px wide but the form card is ${contentWidth}px wide`,
      )
    }
    expectedFallbackUrl = null

    if (pagesMode) {
      const unknownUrl = new URL('no-such-route', baseUrl).toString()
      expectedFallbackUrl = unknownUrl
      await page.goto(unknownUrl)
      await page.getByRole('heading', { name: 'Page not found' }).waitFor()
      expectedFallbackUrl = null
    }

    if (odtNotice > 0) {
      throw new Error(`ODT preview failed: ${odtReason}`)
    }
    if (pagesMode && failedResponses.length > 0) {
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
